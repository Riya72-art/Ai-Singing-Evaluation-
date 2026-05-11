# app/utils/song_detection.py

# Safe import for acrcloud
try:
    import acrcloud
    ACRCLOUD_AVAILABLE = True
except ImportError:
    ACRCLOUD_AVAILABLE = False


def is_song_detection_available():
    """
    Check if song detection service is available
    """
    return ACRCLOUD_AVAILABLE


def detect_song(audio_file_path):
    """
    Detect song using ACRCloud (if available)
    """
    if not ACRCLOUD_AVAILABLE:
        return {
            "status": "unavailable",
            "message": "Song detection service not available (acrcloud not installed)"
        }

    try:
        # Dummy placeholder (since actual ACRCloud setup needs API keys)
        # Replace this with real config if you use ACRCloud later
        return {
            "status": "success",
            "song": "Unknown",
            "artist": "Unknown"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }