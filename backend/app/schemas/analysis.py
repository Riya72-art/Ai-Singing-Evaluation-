from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List


class AnalysisCreate(BaseModel):
    file_name: str


class AnalysisResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    overall_score: Optional[float] = None
    pitch_score: Optional[float] = None
    rhythm_score: Optional[float] = None
    tone_score: Optional[float] = None
    energy_score: Optional[float] = None
    detailed_results: Optional[Dict[str, Any]] = None
    pitch_data: Optional[Dict[str, Any]] = None
    pitch_statistics: Optional[Dict[str, Any]] = None
    sharp_flat_feedback: Optional[Dict[str, Any]] = None
    focal_areas: Optional[List[Dict[str, Any]]] = None
    duration: Optional[float] = None
    sample_rate: Optional[int] = None
    detected_song_title: Optional[str] = None
    detected_artist: Optional[str] = None
    detected_album: Optional[str] = None
    song_detection_confidence: Optional[float] = None
    song_metadata: Optional[Dict[str, Any]] = None
    analysis_status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AnalysisUpdate(BaseModel):
    overall_score: Optional[float] = None
    pitch_score: Optional[float] = None
    rhythm_score: Optional[float] = None
    tone_score: Optional[float] = None
    energy_score: Optional[float] = None
    detailed_results: Optional[Dict[str, Any]] = None
    analysis_status: Optional[str] = None
    error_message: Optional[str] = None
