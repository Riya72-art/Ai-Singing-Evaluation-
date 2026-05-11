import os
import json
import tempfile
import requests
import subprocess
import shutil
import numpy as np
import librosa
from groq import Groq
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()


# ── Auth ─────────────────────────────────────────────────────────────────────
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return credentials.credentials


# ── Audio feature extraction ─────────────────────────────────────────────────
def extract_features(audio_path: str) -> dict:
    y, sr = librosa.load(audio_path, sr=None, mono=True, duration=60)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    beat_frames = librosa.frames_to_time(beats, sr=sr)
    beat_intervals = np.diff(beat_frames)
    rhythm_consistency = float(1 - np.std(beat_intervals) / (np.mean(beat_intervals) + 1e-6)) if len(beat_intervals) > 1 else 0.5
    f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr)
    voiced_f0 = f0[voiced_flag] if voiced_flag is not None else np.array([])
    pitch_stability = float(1 - np.std(voiced_f0) / (np.mean(voiced_f0) + 1e-6)) if len(voiced_f0) > 5 else 0.4
    voiced_ratio = float(np.sum(voiced_flag) / len(voiced_flag)) if voiced_flag is not None else 0.5
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_flux_std = float(np.std(spectral_centroids) / (np.mean(spectral_centroids) + 1e-6))
    tone_smoothness = float(1 - min(spectral_flux_std, 1.0))
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_stability = float(1 - np.mean(np.std(mfccs, axis=1)) / 50)
    mfcc_stability = max(0.0, min(1.0, mfcc_stability))
    rms = librosa.feature.rms(y=y)[0]
    energy_mean = float(np.mean(rms))
    energy_std = float(np.std(rms))
    avg_pitch = float(np.mean(voiced_f0)) if len(voiced_f0) > 0 else 0
    gender = "female" if avg_pitch > 165 else "male"
    return {
        "tempo_bpm": float(tempo),
        "rhythm_consistency": rhythm_consistency,
        "pitch_stability": pitch_stability,
        "voiced_ratio": voiced_ratio,
        "tone_smoothness": tone_smoothness,
        "mfcc_stability": mfcc_stability,
        "energy_mean": energy_mean,
        "energy_std": energy_std,
        "duration_seconds": float(librosa.get_duration(y=y, sr=sr)),
        "avg_pitch_hz": avg_pitch,
        "gender": gender,
        "f0_values": voiced_f0.tolist()[:100],
    }


def features_to_scores(f: dict) -> dict:
    def clamp(val): return int(max(0, min(100, val * 100)))
    return {
        "pitch_score": clamp(f["pitch_stability"] * 0.7 + f["voiced_ratio"] * 0.3),
        "rhythm_score": clamp(f["rhythm_consistency"]),
        "tone_score": clamp(f["tone_smoothness"] * 0.6 + f["mfcc_stability"] * 0.4),
        "clarity_score": clamp(f["mfcc_stability"] * 0.5 + f["voiced_ratio"] * 0.5),
    }


# ── Song Recognition via Audd.io ─────────────────────────────────────────────
def recognize_song(audio_path: str) -> dict:
    audd_key = os.getenv("AUDD_API_KEY", "")
    if not audd_key:
        return {}
    try:
        with open(audio_path, "rb") as f:
            response = requests.post(
                "https://api.audd.io/",
                data={"api_token": audd_key, "return": "apple_music,spotify"},
                files={"file": f},
                timeout=30
            )
        data = response.json()
        if data.get("status") == "success" and data.get("result"):
            result = data["result"]
            return {
                "title": result.get("title", ""),
                "artist": result.get("artist", ""),
                "album": result.get("album", ""),
                "release_date": result.get("release_date", ""),
            }
    except Exception as e:
        print(f"Song recognition failed: {e}")
    return {}


# ── Download Original Song via yt-dlp ────────────────────────────────────────
def download_original_song(song_title: str, artist: str, output_dir: str) -> str:
    try:
        search_query = f"{artist} {song_title} official audio"
        output_path = os.path.join(output_dir, "original.%(ext)s")
        command = [
            "yt-dlp",
            f"ytsearch1:{search_query}",
            "--extract-audio",
            "--audio-format", "wav",
            "--audio-quality", "0",
            "--output", output_path,
            "--no-playlist",
            "--quiet",
        ]
        subprocess.run(command, capture_output=True, text=True, timeout=120)
        for f in os.listdir(output_dir):
            if f.startswith("original") and f.endswith(".wav"):
                return os.path.join(output_dir, f)
    except Exception as e:
        print(f"Download failed: {e}")
    return ""


# ── Compare User vs Original ──────────────────────────────────────────────────
def compare_features(user: dict, original: dict) -> dict:
    user_pitch = user["avg_pitch_hz"]
    orig_pitch = original["avg_pitch_hz"]
    gender = user["gender"]

    # Gender-adjusted pitch comparison
    if gender == "male" and orig_pitch > 200:
        adjusted_user_pitch = user_pitch * 2
        pitch_diff = abs(adjusted_user_pitch - orig_pitch)
        gender_note = "Male voice compared to female original (octave adjusted)"
    elif gender == "female" and orig_pitch < 150:
        adjusted_user_pitch = user_pitch / 2
        pitch_diff = abs(adjusted_user_pitch - orig_pitch)
        gender_note = "Female voice compared to male original (octave adjusted)"
    else:
        pitch_diff = abs(user_pitch - orig_pitch)
        gender_note = f"{gender.capitalize()} voice matched with original"

    pitch_match = max(0, 100 - (pitch_diff / orig_pitch * 100)) if orig_pitch > 0 else 50
    tempo_diff = abs(user["tempo_bpm"] - original["tempo_bpm"])
    tempo_match = max(0, 100 - tempo_diff)
    tone_diff = abs(user["tone_smoothness"] - original["tone_smoothness"])
    tone_match = max(0, 100 - tone_diff * 100)
    rhythm_diff = abs(user["rhythm_consistency"] - original["rhythm_consistency"])
    rhythm_match = max(0, 100 - rhythm_diff * 100)
    overall_similarity = (pitch_match * 0.4 + tempo_match * 0.2 + tone_match * 0.2 + rhythm_match * 0.2)

    return {
        "pitch_match": round(pitch_match),
        "tempo_match": round(tempo_match),
        "tone_match": round(tone_match),
        "rhythm_match": round(rhythm_match),
        "overall_similarity": round(overall_similarity),
        "pitch_diff_hz": round(pitch_diff, 2),
        "tempo_diff_bpm": round(tempo_diff, 1),
        "gender_note": gender_note,
        "user_pitch_hz": round(user_pitch, 2),
        "original_pitch_hz": round(orig_pitch, 2),
        "user_tempo": round(user["tempo_bpm"], 1),
        "original_tempo": round(original["tempo_bpm"], 1),
        "user_f0_values": user["f0_values"],
        "original_f0_values": original["f0_values"],
    }


# ── Groq AI Comparison Feedback ───────────────────────────────────────────────
def generate_comparison_feedback(user_scores: dict, comparison: dict, song_info: dict, raw: dict) -> tuple[str, list[str]]:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    song_name = song_info.get("title", "the original") or "the original"
    artist_name = song_info.get("artist", "the artist") or "the artist"
    prompt = f"""You are a professional vocal coach comparing a user's singing to the original song.
Song: "{song_name}" by {artist_name}
User Voice: {raw['gender'].capitalize()}, Avg Pitch: {raw['avg_pitch_hz']:.1f} Hz
User Scores: Pitch={user_scores['pitch_score']}, Rhythm={user_scores['rhythm_score']}, Tone={user_scores['tone_score']}, Clarity={user_scores['clarity_score']}
Comparison: Pitch Match={comparison['pitch_match']}%, Tempo Match={comparison['tempo_match']}%, Overall Similarity={comparison['overall_similarity']}%
Note: {comparison['gender_note']}
Respond ONLY with JSON:
{{"feedback": "2-3 sentence comparison, warm and constructive", "tips": ["tip to sound more like original", "tip 2", "tip 3"]}}"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500
    )
    text = response.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()
    parsed = json.loads(text)
    return parsed.get("feedback", ""), parsed.get("tips", [])


# ── Basic AI Feedback ─────────────────────────────────────────────────────────
def generate_ai_feedback(scores: dict, raw: dict) -> tuple[str, list[str]]:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    prompt = f"""You are a professional vocal coach analyzing a singing performance.
Scores (0-100): Pitch={scores['pitch_score']}, Rhythm={scores['rhythm_score']}, Tone={scores['tone_score']}, Clarity={scores['clarity_score']}
Tempo: {raw['tempo_bpm']:.1f} BPM, Gender: {raw['gender']}, Avg Pitch: {raw['avg_pitch_hz']:.1f} Hz
Respond ONLY with JSON:
{{"feedback": "2-3 sentence summary", "tips": ["tip 1", "tip 2", "tip 3"]}}"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400
    )
    text = response.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()
    parsed = json.loads(text)
    return parsed.get("feedback", ""), parsed.get("tips", [])


# ── Route 1: /evaluate ────────────────────────────────────────────────────────
@router.post("/evaluate")
async def evaluate_audio(file: UploadFile = File(...), user=Depends(get_current_user)):
    if not (file.content_type.startswith("audio/") or file.filename.rsplit(".", 1)[-1].lower() in {"mp3", "wav", "ogg", "flac", "m4a", "aac"}):
        raise HTTPException(status_code=400, detail="File must be an audio file.")
    suffix = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ".wav"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        raw_features = extract_features(tmp_path)
        scores = features_to_scores(raw_features)
        try:
            feedback, tips = generate_ai_feedback(scores, raw_features)
        except:
            feedback = "Great effort! Keep practicing."
            tips = ["Practice pitch matching.", "Record yourself regularly.", "Work on breathing."]
        return {**scores, "feedback": feedback, "tips": tips,
                "tempo_bpm": round(raw_features["tempo_bpm"], 1),
                "duration_seconds": round(raw_features["duration_seconds"], 1),
                "gender": raw_features["gender"],
                "avg_pitch_hz": round(raw_features["avg_pitch_hz"], 2),
                "f0_values": raw_features["f0_values"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing failed: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# ── Route 2: /upload (with comparison) ───────────────────────────────────────
@router.post("/upload")
async def upload_analysis(
    file: UploadFile = File(...),
    singer_name: str = Form(...),
    song_title: str = Form(...),
    genre: str = Form(None),
    duration: int = Form(None),
    user=Depends(get_current_user),
):
    suffix = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ".wav"
    tmp_dir = tempfile.mkdtemp()
    tmp_path = None

    try:
        # Save user audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=tmp_dir) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        # 1. Extract user features
        user_features = extract_features(tmp_path)
        user_scores = features_to_scores(user_features)

        # 2. Recognize song using Audd.io
        song_info = recognize_song(tmp_path)
        if not song_info:
            song_info = {"title": song_title, "artist": singer_name}

        # 3. Download original song via yt-dlp
        comparison = None
        original_f0 = []
        original_path = download_original_song(
            song_info.get("title", song_title),
            song_info.get("artist", singer_name),
            tmp_dir
        )

        if original_path and os.path.exists(original_path):
            # 4. Extract original features & compare
            original_features = extract_features(original_path)
            comparison = compare_features(user_features, original_features)
            original_f0 = original_features["f0_values"]

        # 5. Generate AI feedback
        try:
            if comparison:
                feedback, tips = generate_comparison_feedback(user_scores, comparison, song_info, user_features)
            else:
                feedback, tips = generate_ai_feedback(user_scores, user_features)
        except:
            feedback = "Great effort! Keep practicing to improve your scores."
            tips = ["Practice pitch matching.", "Record yourself regularly.", "Work on breathing."]

        return {
            **user_scores,
            "feedback": feedback,
            "tips": tips,
            "tempo_bpm": round(user_features["tempo_bpm"], 1),
            "duration_seconds": round(user_features["duration_seconds"], 1),
            "singer_name": singer_name,
            "song_title": song_title,
            "gender": user_features["gender"],
            "avg_pitch_hz": round(user_features["avg_pitch_hz"], 2),
            "f0_values": user_features["f0_values"],
            "detected_song": song_info,
            "comparison": comparison,
            "original_f0_values": original_f0,
            "has_comparison": comparison is not None,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing failed: {str(e)}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ── Route 3: /history ─────────────────────────────────────────────────────────
@router.get("/history")
async def get_history(limit: int = 10, user=Depends(get_current_user)):
    return []