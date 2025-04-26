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
from models import User, Base, Word, Chat, ChatMessagePair, Podcast
from schemas import UserCreate, WordRequest
from crypto import pwd_context,create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from req_gemma import request_gemma2
from image_generator import gen_photo
from fastapi import Form
from dowload_podcasts import clean_podcast_text
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


@app.get("/api/random-podcast")
def get_random_podcast(db: Session = Depends(get_db)):
    podcasts = db.query(Podcast).all()
    if not podcasts:
        raise HTTPException(status_code=404, detail="Нет доступных подкастов")
    
    podcast = random.choice(podcasts)

    # Сохраняем аудио временно, чтобы дать ссылку на файл
    file_path = f"send/podcast_{podcast.id}.mp3"
    with open(file_path, "wb") as f:
        f.write(podcast.audio)
    podcast_text = clean_podcast_text(podcast.transcript)
    return {
        "status": "success",
        "download_url": f"/static/podcast_{podcast.id}.mp3",
        "title": podcast.title,
        "transcript": podcast_text,
        "message": "Случайный подкаст успешно загружен"
    }

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

        
        save_message_pair_to_db(
            db=db,
            chat_id=chat_id,
            user_audio=audio_data,
            user_transcript=user_text,
            bot_audio=bot_audio_data,
            bot_transcript=model_text
        )
        print("answer",model_text)
        return {
            "status": "success",
            "download_url": "/static/output.wav",
            "user_transcript": user_text,
            "model_transcript": model_text,
            "message": "Аудио и тексты успешно обработаны"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get_answer")
async def upload_audio(
    message: str = Form(...),  # Убедись, что здесь Form
    chat_id: int = Form(...),  # Также используем Form для chat_id
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    try:
        model_text = request_gemma2(message + "   give small answer")
        save_message_pair_to_db(
            db=db,
            chat_id=chat_id,
            user_audio=None,
            user_transcript=message,
            bot_audio=None,
            bot_transcript=model_text
        )
        print("answer", model_text)
        return {
            "status": "success",
            "user_message": message,
            "model_message": model_text,
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

    if not word_text:
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
        
        new_chat = Chat(user_id=user.id)
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        
        return {"chat_id": new_chat.id, "message": "Чат успешно создан."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/analyze-user-transcripts")
def analyze_user_transcripts(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # 1. Получить последний чат пользователя
    last_chat = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.created_at.desc())
        .first()
    )
    print('last chat',last_chat)
    if not last_chat:
        return {"error": "У пользователя нет чатов"}

    # 2. Собрать все тексты пользователя
    transcripts = (
        db.query(ChatMessagePair.user_transcript)
        .filter(ChatMessagePair.chat_id == last_chat.id)
        .filter(ChatMessagePair.user_transcript.isnot(None))
        .all()
    )
    print('transcripts',transcripts)

    if not transcripts:
        return {"error": "Нет сообщений для анализа"}

    # 3. Сформировать текст для анализа
    joined_text = "\n".join([t[0] for t in transcripts])
    prompt = (
        "Проанализируй следующие предложения с точки зрения синтаксиса и грамматики. "
        "Предложи улучшения для каждого, если нужно. Тексты:\n\n"
        f"{joined_text}"
    )

    # 4. Отправить в gemma2
    analysis = request_gemma2(prompt)
    print('analys',analysis)

    return {
        "prompt_sent": prompt,
        "analysis_result": analysis
    }
    
@app.post("/get")
def check_translation(data: dict):
    word = data.get("word")
    if not word:
        raise HTTPException(status_code=400, detail="Неверный формат запроса")
    examples = request_gemma2(f"write only three examples with word '{word}',only examples ")
    return {
        "examples": examples,
    }
    
@app.post("/gen_imege")
def gen_imege(data: WordRequest):
    word = data.word
    if not word:
        raise HTTPException(status_code=400, detail="Неверный формат запроса")
    promt_to_image_gen = request_gemma2(f"create a prompt to generate a photo so that a person can guess the word from its picture, return only the prompt itself in response, the maximum response size is 77 tokens. word - {word}")
    gen_photo(promt_to_image_gen)
    return {
        "status": "success",
        "download_url": "/static/image.png",
    }
@app.post("/word-info")
def get_word_info(data: WordRequest):
    word = data.word
    if not word:
        return {"error": "Word is empty"}

    examples = request_gemma2(f"write only three examples with word '{word}',only examples ")
    translation = request_gemma2(f"Translate '{word}' to Russian, return only Translate")

    return {
        "word": word,
        "translation": translation,
        "examples": examples
    }