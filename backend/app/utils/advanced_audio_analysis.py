"""
Advanced Audio Analysis using CREPE for professional-grade pitch detection
Provides detailed pitch feedback, sharp/flat detection, and focal areas
"""

import numpy as np
import librosa
try:
    import crepe
    CREPE_AVAILABLE = True
except ImportError:
    CREPE_AVAILABLE = False
    print("⚠️  Warning: CREPE not available. Using basic pitch detection.")
from typing import Dict, List, Any, Optional, Tuple


def perform_advanced_analysis(file_path: str) -> Dict[str, Any]:
    """
    Perform advanced singing analysis using CREPE pitch detection
    
    Args:
        file_path: Path to audio file
        
    Returns:
        Dictionary containing pitch data, feedback, and recommendations
    """
    try:
        # Load audio
        y, sr = librosa.load(file_path, sr=16000)  # CREPE works best at 16kHz
        duration = librosa.get_duration(y=y, sr=sr)
        
        if CREPE_AVAILABLE:
            # Perform CREPE pitch detection
            time_cents, frequencies, confidence, activation = crepe.predict(
                y, sr, viterbi=True, model='full'
            )
            
            # Get valid pitch data (filter by confidence threshold)
            confidence_threshold = 0.1
            valid_mask = confidence >= confidence_threshold
            valid_frequencies = frequencies[valid_mask]
            valid_times = time_cents[valid_mask]
        else:
            # Fallback to basic pitch detection using librosa
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=75, fmax=1600)
            
            # Get the most prominent pitch for each frame
            valid_frequencies = []
            valid_times = []
            for i in range(pitches.shape[1]):
                frame_pitches = pitches[:, i]
                frame_magnitudes = magnitudes[:, i]
                if np.max(frame_magnitudes) > 0.1:  # Minimum magnitude threshold
                    max_idx = np.argmax(frame_magnitudes)
                    pitch = frame_pitches[max_idx]
                    if 75 <= pitch <= 1600:  # Reasonable vocal range
                        valid_frequencies.append(pitch)
                        valid_times.append(i * 512 / sr)  # Frame to time conversion
            
            valid_frequencies = np.array(valid_frequencies)
            valid_times = np.array(valid_times)
        
        if len(valid_frequencies) == 0:
            return {
                "error": "No valid pitch detected. Make sure to sing clearly.",
                "pitch_data": None
            }
        
        # Calculate pitch statistics
        pitch_stats = calculate_pitch_statistics(
            valid_frequencies, valid_times, frequencies
        )
        
        # Detect sharp/flat tendencies
        sharp_flat_feedback = analyze_sharp_flat(valid_frequencies)
        
        # Generate focal areas
        focal_areas = identify_focal_areas(
            valid_frequencies, frequencies, confidence, pitch_stats
        )
        
        # Calculate overall pitch score
        pitch_score = calculate_pitch_score(pitch_stats, valid_frequencies)
        
        return {
            "success": True,
            "duration": round(duration, 2),
            "sample_rate": sr,
            "pitch_score": round(pitch_score, 2),
            "pitch_data": {
                "times": time_cents.tolist(),  # All time points
                "frequencies": frequencies.tolist(),  # All frequencies (including unvoiced)
                "confidence": confidence.tolist(),  # Confidence scores
                "valid_times": valid_times.tolist(),
                "valid_frequencies": valid_frequencies.tolist(),
            },
            "pitch_statistics": pitch_stats,
            "sharp_flat_feedback": sharp_flat_feedback,
            "focal_areas": focal_areas,
        }
        
    except Exception as e:
        return {
            "error": f"Advanced analysis failed: {str(e)}",
            "pitch_data": None
        }


def calculate_pitch_statistics(valid_frequencies: np.ndarray, 
                              valid_times: np.ndarray,
                              all_frequencies: np.ndarray) -> Dict[str, Any]:
    """
    Calculate detailed pitch statistics
    """
    # Convert Hz to cents for easier comparison (C4 = 261.63 Hz as reference)
    c4_hz = 261.63
    
    # Exclude unvoiced frames (0 Hz)
    voiced_frequencies = valid_frequencies[valid_frequencies > 0]
    
    if len(voiced_frequencies) == 0:
        return {
            "average_frequency": 0,
            "min_frequency": 0,
            "max_frequency": 0,
            "frequency_range": 0,
            "stability": 0,
            "vibrato_rate": 0,
        }
    
    avg_freq = np.mean(voiced_frequencies)
    min_freq = np.min(voiced_frequencies)
    max_freq = np.max(voiced_frequencies)
    freq_range = max_freq - min_freq
    
    # Frequency stability (lower std = more stable)
    stability = 100 - (np.std(voiced_frequencies) / (avg_freq / 10))  # Normalize by freq
    stability = max(0, min(100, stability))
    
    # Detect vibrato rate (oscillation frequency)
    vibrato_rate = detect_vibrato_rate(voiced_frequencies)
    
    return {
        "average_frequency": round(avg_freq, 2),
        "average_frequency_note": frequency_to_note(avg_freq),
        "min_frequency": round(min_freq, 2),
        "max_frequency": round(max_freq, 2),
        "frequency_range": round(freq_range, 2),
        "frequency_range_octaves": round(freq_range / (avg_freq / 2), 2),
        "stability": round(stability, 2),  # 0-100 score
        "vibrato_rate": round(vibrato_rate, 2),  # Hz
    }


def analyze_sharp_flat(frequencies: np.ndarray) -> Dict[str, Any]:
    """
    Analyze if user is singing sharp (high) or flat (low) relative to standard pitch
    """
    # Common reference: concert A = 440 Hz (A4)
    # Each semitone = ratio of 2^(1/12) ≈ 1.0595
    
    semitone_ratio = 2 ** (1/12)
    
    # Filter valid frequencies
    valid_freq = frequencies[frequencies > 0]
    
    if len(valid_freq) == 0:
        return {
            "tendency": "No pitch detected",
            "feedback": "Sing more clearly so we can analyze your pitch",
            "sharpness_percent": 0,
        }
    
    # For a reference pitch of 440 Hz (A4), check deviation
    # But we'll analyze relative to the user's natural range
    reference_freq = np.median(valid_freq)
    
    # Analyze deviations in cents (100 cents = 1 semitone)
    cents_deviations = 1200 * np.log2(valid_freq / reference_freq)
    mean_deviation = np.mean(cents_deviations)
    
    # Classify
    if mean_deviation > 20:  # More than 20 cents sharp
        tendency = "Sharp"
        feedback = f"You're singing {abs(mean_deviation):.0f} cents sharp. Try lowering your pitch slightly."
        sharpness_percent = min(100, (mean_deviation / 50) * 100)
    elif mean_deviation < -20:  # More than 20 cents flat
        tendency = "Flat"
        feedback = f"You're singing {abs(mean_deviation):.0f} cents flat. Try raising your pitch slightly."
        sharpness_percent = max(-100, (mean_deviation / 50) * 100)
    else:
        tendency = "In Tune"
        feedback = "Great! Your pitch is well-centered."
        sharpness_percent = 0
    
    return {
        "tendency": tendency,
        "feedback": feedback,
        "mean_deviation_cents": round(mean_deviation, 2),
        "sharpness_percent": round(sharpness_percent, 2),  # -100 to 100
    }


def detect_vibrato_rate(frequencies: np.ndarray) -> float:
    """
    Detect the rate of vibrato (oscillation in pitch)
    """
    if len(frequencies) < 10:
        return 0.0
    
    try:
        # Apply high-pass filter to detect oscillations
        fft = np.fft.fft(frequencies)
        freqs = np.fft.fftfreq(len(frequencies))
        
        # Vibrato typically 4-8 Hz, look in that range
        vibrato_range = np.where((freqs > 0.02) & (freqs < 0.1))[0]
        
        if len(vibrato_range) > 0:
            peak_idx = vibrato_range[np.argmax(np.abs(fft[vibrato_range]))]
            vibrato_rate = freqs[peak_idx] * len(frequencies)  # Convert back to Hz
            return max(0, vibrato_rate)
        
        return 0.0
    except:
        return 0.0


def identify_focal_areas(valid_frequencies: np.ndarray,
                        all_frequencies: np.ndarray,
                        confidence: np.ndarray,
                        pitch_stats: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Identify areas where user should focus their practice
    """
    focal_areas = []
    
    # Issue 1: Low confidence (unstable pitch)
    low_confidence_mask = confidence < 0.3
    if np.sum(low_confidence_mask) / len(confidence) > 0.3:  # >30% of time
        focal_areas.append({
            "area": "Pitch Stability",
            "issue": "Your pitch is unstable in some sections",
            "tip": "Focus on holding steady notes. Use a metronome to help with consistency.",
            "priority": "High"
        })
    
    # Issue 2: Wide frequency range (pitch jumps)
    if pitch_stats["frequency_range"] > pitch_stats["average_frequency"] * 0.5:
        focal_areas.append({
            "area": "Register Control",
            "issue": "Large jumps between high and low notes",
            "tip": "Work on smooth transitions between registers. Practice scales.",
            "priority": "Medium"
        })
    
    # Issue 3: Weak vibrato (or no vibrato)
    if pitch_stats["vibrato_rate"] < 4 or pitch_stats["vibrato_rate"] > 8:
        focal_areas.append({
            "area": "Vibrato Control",
            "issue": f"Vibrato rate is {pitch_stats['vibrato_rate']:.1f} Hz (normal: 4-8 Hz)",
            "tip": "Practice vocal exercises to develop consistent vibrato.",
            "priority": "Medium"
        })
    
    # Issue 4: Stability score
    if pitch_stats["stability"] < 70:
        focal_areas.append({
            "area": "Vocal Precision",
            "issue": f"Pitch consistency needs work ({pitch_stats['stability']:.0f}/100)",
            "tip": "Record yourself and listen back. Use a tuner app to check accuracy.",
            "priority": "High"
        })
    
    # If no issues, give positive feedback
    if len(focal_areas) == 0:
        focal_areas.append({
            "area": "Overall Performance",
            "issue": "No major issues detected!",
            "tip": "Keep practicing to refine your technique further.",
            "priority": "Low"
        })
    
    return focal_areas


def calculate_pitch_score(pitch_stats: Dict[str, Any], 
                         valid_frequencies: np.ndarray) -> float:
    """
    Calculate overall pitch quality score (0-100)
    """
    stability_weight = 0.4
    range_weight = 0.2
    vibrato_weight = 0.25
    consistency_weight = 0.15
    
    # Stability score (40% weight)
    stability_score = pitch_stats["stability"]
    
    # Range score (20% weight) - reward good range but not too wide
    avg_freq = pitch_stats["average_frequency"]
    freq_range = pitch_stats["frequency_range"]
    
    # Good range is 1-2 octaves
    ideal_range = avg_freq * 0.5  # ~1 octave
    range_score = 100 - (abs(freq_range - ideal_range) / ideal_range * 100)
    range_score = max(0, min(100, range_score))
    
    # Vibrato score (25% weight) - good vibrato is 4-8 Hz
    vibrato_rate = pitch_stats["vibrato_rate"]
    if 4 <= vibrato_rate <= 8:
        vibrato_score = 100
    else:
        vibrato_score = max(0, 100 - (abs(vibrato_rate - 6) / 4 * 100))
    
    # Consistency score (15% weight) - based on frequency variation
    consistency = 100 - (np.std(valid_frequencies) / (avg_freq / 5))
    consistency_score = max(0, min(100, consistency))
    
    # Weighted average
    overall_score = (
        stability_score * stability_weight +
        range_score * range_weight +
        vibrato_score * vibrato_weight +
        consistency_score * consistency_weight
    )
    
    return round(overall_score, 2)


def frequency_to_note(frequency: float) -> str:
    """
    Convert frequency (Hz) to musical note name
    """
    if frequency <= 0:
        return "N/A"
    
    # A4 = 440 Hz
    notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    
    # Calculate semitones from C0 (16.35 Hz)
    c0_hz = 16.35
    semitones_from_c0 = 12 * np.log2(frequency / c0_hz)
    
    octave = int(semitones_from_c0 // 12)
    note_index = int(semitones_from_c0 % 12)
    
    note = notes[note_index]
    return f"{note}{octave}"
