from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import get_settings
import os

settings = get_settings()

# SQLite: Create db folder if it doesn't exist
if settings.DATABASE_URL.startswith("sqlite"):
    os.makedirs("db", exist_ok=True)

# SQLite does NOT support pool_size / max_overflow — use NullPool or no pool args
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine_kwargs = {
    "echo": settings.SQLALCHEMY_ECHO,
    "pool_pre_ping": True,
}

if is_sqlite:
    # SQLite requires check_same_thread=False for FastAPI
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    # StaticPool is better for SQLite in testing; NullPool works for dev
    from sqlalchemy.pool import StaticPool
    engine_kwargs["poolclass"] = StaticPool
else:
    # PostgreSQL / MySQL — full connection pool
    engine_kwargs["pool_size"]   = 10
    engine_kwargs["max_overflow"] = 20

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
