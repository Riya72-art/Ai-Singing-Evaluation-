import os

# Try importing optional audio libraries - not required for basic functionality
try:
    import librosa
    import numpy as np
    AUDIO_ANALYSIS_AVAILABLE = True
except ImportError:
    AUDIO_ANALYSIS_AVAILABLE = False
    print("⚠️  Warning: librosa/numpy not installed. Audio analysis will use mock data.")


async def analyze_singing_audio(file_path: str) -> dict:
    """
    Analyze singing audio and extract quality metrics using librosa
    
    Returns:
        Dictionary with scores for pitch, rhythm, tone, and overall score
    """
    try:
        if not AUDIO_ANALYSIS_AVAILABLE:
            # Return mock analysis data for testing
            return {
                "overall_score": 82.5,
                "pitch_score": 85.0,
                "rhythm_score": 80.0,
                "tone_score": 82.0,
                "duration": 45.5,
                "sample_rate": 44100,
                "detailed_results": {
                    "mfcc_mean": 0.45,
                    "spectral_centroid": 2050.0,
                    "zero_crossing_rate": 0.12,
                }
            }
        
        # Load audio file using librosa
        y, sr = librosa.load(file_path, sr=None)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Extract features
        pitch_score = extract_pitch_score(y, sr)
        rhythm_score = extract_rhythm_score(y, sr)
        tone_score = extract_tone_score(y, sr)
        energy_score = extract_energy_score(y, sr)
        
        # Calculate overall score (weighted average)
        overall_score = (pitch_score * 0.30 + rhythm_score * 0.30 + tone_score * 0.25 + energy_score * 0.15)
        
        # Extract detailed features
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
        
        return {
            "overall_score": round(overall_score, 2),
            "pitch_score": round(pitch_score, 2),
            "rhythm_score": round(rhythm_score, 2),
            "tone_score": round(tone_score, 2),
            "energy_score": round(energy_score, 2),
            "duration": round(duration, 2),
            "sample_rate": sr,
            "detailed_results": {
                "mfcc_mean": float(np.mean(mfcc)),
                "spectral_centroid": float(np.mean(spectral_centroid)),
                "zero_crossing_rate": float(np.mean(zero_crossing_rate)),
                "mfcc_std": float(np.std(mfcc)),
                "spectral_centroid_std": float(np.std(spectral_centroid)),
            }
        }
    except Exception as e:
        raise Exception(f"Audio analysis failed: {str(e)}")


def extract_pitch_score(y, sr) -> float:
    """Extract pitch quality score (0-100)
    
    Uses spectral features to measure pitch consistency and stability.
    Higher score indicates more stable pitch.
    """
    if not AUDIO_ANALYSIS_AVAILABLE:
        return 82.0
    
    try:
        # Use harmonic-percussive source separation
        y_harmonic, _ = librosa.effects.hpss(y)
        
        # Extract chroma features as pitch indicator
        chroma = librosa.feature.chroma_cqt(y=y_harmonic, sr=sr)
        chroma_energy = np.sum(chroma, axis=0)
        
        # Score based on consistency of chroma energy
        if len(chroma_energy) > 0:
            consistency = 100 - (np.std(chroma_energy) / (np.mean(chroma_energy) + 1e-10) * 50)
            return max(0, min(100, consistency))
        return 75.0
    except Exception as e:
        print(f"Pitch extraction error: {e}")
        return 75.0


def extract_rhythm_score(y, sr) -> float:
    """Extract rhythm/tempo consistency score (0-100)
    
    Analyzes beat detection and tempo stability.
    Higher score indicates more consistent rhythm.
    """
    if not AUDIO_ANALYSIS_AVAILABLE:
        return 80.0
    
    try:
        # Compute onset strength
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        
        # Detect beats using dynamic programming
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='samples')
        
        # Calculate beat interval consistency
        if len(beats) > 1:
            beat_intervals = np.diff(beats)
            if np.mean(beat_intervals) > 0:
                consistency = 100 - (np.std(beat_intervals) / np.mean(beat_intervals) * 100)
                return max(0, min(100, consistency))
        return 75.0
    except Exception as e:
        print(f"Rhythm extraction error: {e}")
        return 75.0


def extract_tone_score(y, sr) -> float:
    """Extract tone quality score (0-100)
    
    Uses MFCC to assess tonal characteristics.
    Higher score indicates richer tone quality.
    """
    if not AUDIO_ANALYSIS_AVAILABLE:
        return 82.0
    
    try:
        # Extract MFCC (Mel-Frequency Cepstral Coefficients)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        
        # Extract delta (first derivative) for dynamics
        mfcc_delta = librosa.feature.delta(mfcc)
        
        # Score based on tonal richness (higher MFCC entropy = richer tone)
        mfcc_mean = np.mean(mfcc)
        mfcc_var = np.var(mfcc)
        
        # Normalize to 0-100 range
        tone_score = min(100, (mfcc_var / 50) * 100)
        return max(0, tone_score)
    except Exception as e:
        print(f"Tone extraction error: {e}")
        return 75.0


def extract_energy_score(y, sr) -> float:
    """Extract vocal energy/volume consistency score (0-100)
    
    Measures how well the voice maintains energy/volume.
    Higher score indicates consistent vocal power.
    """
    if not AUDIO_ANALYSIS_AVAILABLE:
        return 80.0
    
    try:
        # Compute RMS energy
        rms = librosa.feature.rms(y=y)[0]
        
        # Score based on energy consistency (lower variation = better control)
        if len(rms) > 0 and np.mean(rms) > 0:
            energy_consistency = 100 - (np.std(rms) / np.mean(rms) * 100)
            return max(0, min(100, energy_consistency))
        return 75.0
    except Exception as e:
        print(f"Energy extraction error: {e}")
        return 75.0
