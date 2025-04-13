from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from help import recognize_speech_from_wav
from to_audio import text_to_speech
from fastapi.staticfiles import StaticFiles
app = FastAPI()

from req_gemma import request_gemma2
# Монтируем папку send как /static
app.mount("/static", StaticFiles(directory="send"), name="static")
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
        text = recognize_speech_from_wav(r"uploads\recording.wav")
        print(text)
        answer = request_gemma2(text)
        print(answer)
        save_wav = text_to_speech(answer)
        
        
        file_path = "send/output.wav"
        return {
        "status": "success",
        "filename": "output.wav",
        "saved_path": file_path,
        "download_url": "/static/output.wav",  # URL для скачивания
        "message": "Audio uploaded successfully"
    }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))