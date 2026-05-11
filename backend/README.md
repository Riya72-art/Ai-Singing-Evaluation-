# AI Singing Quality Evaluation Backend

A FastAPI-based backend for analyzing singing quality using machine learning.

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- PostgreSQL
- pip

### 2. Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

```bash
# Create database
createdb ai_singing_db

# Or using psql
psql -U postgres
CREATE DATABASE ai_singing_db;
```

### 5. Configure Environment Variables
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your settings
# Important: Update SECRET_KEY and DATABASE_URL
```

Example `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/ai_singing_db
SECRET_KEY=your-secret-key-here
DEBUG=True
PORT=8000
```

### 6. Run the Server
```bash
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Analysis
- `POST /api/analysis/upload` - Upload and analyze audio file
- `GET /api/analysis/history` - Get user's analysis history
- `GET /api/analysis/{analysis_id}` - Get specific analysis
- `DELETE /api/analysis/{analysis_id}` - Delete analysis

## Project Structure

```
backend/
├── app/
│   ├── models/          # SQLAlchemy database models
│   ├── routes/          # API endpoints
│   ├── schemas/         # Pydantic validation schemas
│   ├── utils/           # Helper functions (security, audio analysis)
│   ├── config.py        # Configuration settings
│   ├── database.py      # Database configuration
│   └── __init__.py
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Features

- **User Authentication**: JWT-based authentication
- **Audio Upload**: Support for MP3, WAV, M4A, FLAC, OGG formats
- **Singing Analysis**: 
  - Pitch Quality Score
  - Rhythm Consistency Score
  - Tone Quality Score
  - Overall Score
  - Detailed Audio Features (MFCC, Spectral Centroid, etc.)
- **Song Detection**: Automatic song recognition using ACRCloud (optional)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API Documentation**: Auto-generated Swagger UI

## Song Detection Setup (Optional)

The system can automatically detect the song being sung for better analysis context.

### 1. Sign up for ACRCloud
1. Go to [ACRCloud](https://www.acrcloud.com/)
2. Create a free account
3. Get your Access Key and Access Secret from the dashboard

### 2. Configure Environment Variables
Add the following to your `.env` file:
```
ACR_HOST=identify-eu-west-1.acrcloud.com
ACR_ACCESS_KEY=your-access-key-here
ACR_ACCESS_SECRET=your-access-secret-here
```

### 3. Install Additional Dependencies
```bash
pip install acrcloud
```

### 4. Test Song Detection
Upload an audio file and the system will attempt to identify the song automatically.

## Supported Audio Formats

- MP3
- WAV
- M4A
- FLAC
- OGG

## Troubleshooting

### Database Connection Error
```
Make sure PostgreSQL is running and the DATABASE_URL is correct
```

### Audio Analysis Error
```
Ensure librosa and scipy are properly installed
pip install --upgrade librosa scipy numpy
```

### CORS Error
```
Update CORS origins in main.py if frontend is on different port
```

## Development

### Running Tests (if tests exist)
```bash
pytest
```

### Code Style
```bash
# Format code
black .

# Lint
flake8 .
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Change `SECRET_KEY` to a strong random string
3. Use environment variables for sensitive data
4. Deploy using Gunicorn:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```

## License
MIT
