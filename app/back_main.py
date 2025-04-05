from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload-audio")
async def upload_audio(audio: UploadFile = File(...)):
    try:
        # Сохраняем файл
        file_location = f"{UPLOAD_DIR}/{audio.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(await audio.read())
        
        return {
            "status": "success",
            "filename": audio.filename,
            "saved_path": file_location,
            "message": "Audio uploaded successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))