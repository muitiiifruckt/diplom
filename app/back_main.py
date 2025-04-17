from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from help import recognize_speech_from_wav
from to_audio import text_to_speech
from fastapi.staticfiles import StaticFiles
import logging
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine,get_db
from models import User, Base, Word, Chat, ChatMessagePair
from schemas import UserCreate
from crypto import pwd_context,create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from req_gemma import request_gemma2

import random 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


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

from fastapi import Form

def save_message_pair_to_db(
    db: Session,
    chat_id: int,
    user_audio: bytes,
    user_transcript: str,
    bot_audio: bytes,
    bot_transcript: str
):
    message_pair = ChatMessagePair(
        chat_id=chat_id,
        user_audio=user_audio,
        user_transcript=user_transcript,
        bot_audio=bot_audio,
        bot_transcript=bot_transcript
    )
    db.add(message_pair)
    db.commit()


@app.post("/api/upload-audio")
async def upload_audio(
    audio: UploadFile = File(...),
    chat_id: int = Form(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        file_location = os.path.join(UPLOAD_DIR, audio.filename)
        audio_data = await audio.read()
        with open(file_location, "wb+") as file_object:
            file_object.write(audio_data)

        user_text = recognize_speech_from_wav(file_location)
        model_text = request_gemma2(user_text + "   give small answer")
        save_wav = text_to_speech(model_text)

        with open("send/output.wav", "rb") as bot_audio_file:
            bot_audio_data = bot_audio_file.read()

        # 💾 сохраняем в базу
        save_message_pair_to_db(
            db=db,
            chat_id=chat_id,
            user_audio=audio_data,
            user_transcript=user_text,
            bot_audio=bot_audio_data,
            bot_transcript=model_text
        )

        return {
            "status": "success",
            "download_url": "/static/output.wav",
            "user_transcript": user_text,
            "model_transcript": model_text,
            "message": "Аудио и тексты успешно обработаны"
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

@app.get("/get-random-word")
def get_random_word(db: Session = Depends(get_db)):
    words = db.query(Word).all()
    if not words:
        raise HTTPException(status_code=404, detail="Слов нет в базе")
    word = random.choice(words)
    return {"word": word.word}

@app.post("/check-translation")
def check_translation(data: dict, db: Session = Depends(get_db)):
    word_text = data.get("word")
    user_translation = data.get("user_translation")

    if not word_text or not user_translation:
        raise HTTPException(status_code=400, detail="Неверный формат запроса")

    word_entry = db.query(Word).filter(Word.word == word_text).first()

    if not word_entry:
        raise HTTPException(status_code=404, detail="Слово не найдено")

    correct = word_entry.translation.strip().lower() == user_translation.strip().lower()
    return {
        "correct": correct,
        "correct_translation": word_entry.translation
    }
    
@app.post("/api/create-chat")
async def create_chat(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Создание чата для текущего пользователя."""
    try:
        # Создаем новый чат для текущего пользователя
        new_chat = Chat(user_id=user.id)
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        
        return {"chat_id": new_chat.id, "message": "Чат успешно создан."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))