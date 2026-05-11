# Backend Setup Guide for Windows

## Step-by-Step Installation

### 1. Open PowerShell in the Backend Folder
```powershell
# Navigate to backend folder (if not already there)
cd "C:\Users\Riya Yadav\OneDrive\Desktop\AI SINGING\AI Singing Quality Evaluation System\backend"
```

### 2. Create Virtual Environment
```powershell
python -m venv venv
```

### 3. Activate Virtual Environment
```powershell
# On Windows PowerShell
.\venv\Scripts\Activate.ps1

# If you get an error, try this Command Prompt instead
cmd
cd backend
venv\Scripts\activate
```

### 4. Install Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

**Note:** If you get psycopg errors, use this alternative command:
```powershell
pip install -r requirements.txt --no-binary psycopg
```

### 5. Create PostgreSQL Database (Optional - For Production)

If you want to use PostgreSQL locally, install it from: https://www.postgresql.org/download/windows/

Then create database:
```powershell
# Using psql (PostgreSQL command line)
psql -U postgres
CREATE DATABASE ai_singing_db;
```

### 6. Configure Environment Variables
```powershell
# Copy the example file
Copy-Item .env.example -Destination .env

# Edit .env with your settings (use Notepad)
notepad .env
```

**Important:** Update these values in `.env`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ai_singing_db
SECRET_KEY=your-secret-key-min-32-chars-long-change-in-production
DEBUG=True
PORT=8000
```

### 7. Run the Backend Server
```powershell
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### 8. Test the API
Open browser and go to:
- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Troubleshooting

### Error: "ModuleNotFoundError: No module named 'fastapi'"
- Make sure virtual environment is activated: `.\venv\Scripts\Activate.ps1`
- Reinstall dependencies: `pip install -r requirements.txt`

### Error: "pg_config executable not found"
- This is fixed in the updated `requirements.txt`
- If still occurs, try: `pip install --force-reinstall --no-cache-dir psycopg`

### Error: "Cannot connect to PostgreSQL"
- Make sure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify credentials are correct

### Error: "Address already in use"
- Port 8000 is already in use
- Change PORT in `.env` file to 8001, 8002, etc.

### Module Installation Takes Too Long
- Some packages like librosa download additional models
- This is normal, be patient
- You can skip audio analysis features if needed:
  ```powershell
  pip install -r requirements-basic.txt
  ```

---

## Alternative: Quick Start without PostgreSQL

For development, you can use SQLite:

Edit `.env`:
```
DATABASE_URL=sqlite:///./test.db
```

This will work with everything except you won't need PostgreSQL installed!

---

## Next Steps

1. **Verify backend is running:**
   - Visit http://localhost:8000/health
   - You should see: `{"status": "healthy"}`

2. **Test registration:**
   - Visit http://localhost:8000/docs
   - Click on `/api/auth/register`
   - Try it out with test data

3. **Start Frontend:**
   ```powershell
   # In another PowerShell window
   cd frontend
   npm start
   ```

4. **Frontend should connect to backend automatically**
   - API calls go to http://localhost:8000
   - Visit http://localhost:3000

---

## Production Deployment

When deploying to production:

1. Set `DEBUG=False` in `.env`
2. Generate a strong `SECRET_KEY`:
   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. Use production PostgreSQL database
4. Run with Gunicorn:
   ```powershell
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```
