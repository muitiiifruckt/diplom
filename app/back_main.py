from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from help import recognize_speech_from_wav
from to_audio import text_to_speech
from fastapi.staticfiles import StaticFiles
import logging
from database import get_db
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Base
from schemas import UserCreate
from crypto import pwd_context,create_access_token
from fastapi.security import OAuth2PasswordRequestForm

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

from req_gemma import request_gemma2
# Монтируем папку send как /static
app.mount("/static", StaticFiles(directory="send"), name="static")
# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        answer = request_gemma2(text + "   give small answer")
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
    
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    hashed_password = pwd_context.hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "Пользователь зарегистрирован"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = next(get_db())
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверные данные")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}