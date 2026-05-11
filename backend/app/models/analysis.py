from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey
from datetime import datetime
from app.database import Base


class Analysis(Base):
    __tablename__ = 'analyses'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    overall_score = Column(Float, nullable=True)
    pitch_score = Column(Float, nullable=True)
    rhythm_score = Column(Float, nullable=True)
    tone_score = Column(Float, nullable=True)
    energy_score = Column(Float, nullable=True)
    detected_song_title = Column(String(255), nullable=True)
    detected_artist = Column(String(255), nullable=True)
    duration = Column(Float, nullable=True)
    sample_rate = Column(Integer, nullable=True)
    analysis_status = Column(String(50), default='pending')
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Analysis(id={self.id}, user_id={self.user_id})>'
