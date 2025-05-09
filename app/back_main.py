from fastapi import FastAPI, UploadFile, File, HTTPException,Body
from fastapi.middleware.cors import CORSMiddleware
import os
from app.audio_text_modul.audio_to_text import recognize_speech_from_wav
from app.audio_text_modul.text_to_audio import text_to_speech
from fastapi.staticfiles import StaticFiles
from .oib.password_recovery import sendEmail
from datetime import datetime, timedelta
import secrets
import logging
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database_work.database import SessionLocal, engine,get_db
from .database_work.models import User, Base, Word, Chat, ChatMessagePair, Podcast, PasswordResetToken
from .database_work.schemas import UserCreate, WordRequest, PasswordResetRequest, PasswordReset
from .database_work.crypto import pwd_context,create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from .ai_modul.req_gemma import request_gemma2
from .ai_modul.image_generator import gen_photo
from fastapi import Form
from .fill_database.dowload_podcasts import clean_podcast_text
import random 
from app.language_tests.grammar import generate_grammar_test
from app.language_tests.vocabulary import generate_vocabulary_test
from app.language_tests.reading import generate_reading_test
from app.language_tests.listening import generate_listening_test
from app.language_tests.writing import generate_writing_prompt, evaluate_writing
from app.language_tests.level_test import generate_level_test, evaluate_level_test

base_url = "http://localhost:8000"

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
    print('form_data',form_data.username,form_data.password)
    db = next(get_db())
    user = db.query(User).filter(User.username == form_data.username).first()
    print('user',user)
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
@app.get("/api/my-chats")
def get_my_chats(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.created_at.desc())
        .all()
    )
    # Можно вернуть только нужные поля
    return [
        {
            "chat_id": chat.id,
            "created_at": chat.created_at.isoformat()
        }
        for chat in chats
    ]
@app.get("/api/chat/{chat_id}/messages")
def get_chat_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден или не принадлежит пользователю")

    messages = (
        db.query(ChatMessagePair)
        .filter(ChatMessagePair.chat_id == chat_id)
        .order_by(ChatMessagePair.timestamp.asc())
        .all()
    )

    result = []
    for msg in messages:
        user_audio_url = None
        bot_audio_url = None

        # Сохраняем аудио пользователя, если есть
        if msg.user_audio:
            user_audio_path = f"send/user_audio_{msg.id}.wav"
            with open(user_audio_path, "wb") as f:
                f.write(msg.user_audio)
            user_audio_url = f"/static/user_audio_{msg.id}.wav"

        # Сохраняем аудио бота, если есть
        if msg.bot_audio:
            bot_audio_path = f"send/bot_audio_{msg.id}.wav"
            with open(bot_audio_path, "wb") as f:
                f.write(msg.bot_audio)
            bot_audio_url = f"/static/bot_audio_{msg.id}.wav"

        result.append({
            "id": msg.id,
            "user_transcript": msg.user_transcript,
            "bot_transcript": msg.bot_transcript,
            "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
            "user_audio_url": user_audio_url,
            "bot_audio_url": bot_audio_url,
        })
    return result


@app.get("/api/tests/grammar")
def get_grammar_test(n: int = 5):
    return generate_grammar_test(n)

@app.get("/api/tests/vocabulary")
def get_vocabulary_test(n: int = 5):
    return generate_vocabulary_test(n)

@app.get("/api/tests/reading")
def get_reading_test(n: int = 5, questions: int = 3):
    return generate_reading_test(n, questions)

@app.get("/api/tests/listening")
def get_listening_test(n: int = 5):
    return generate_listening_test(n)

@app.get("/api/tests/writing/prompt")
def get_writing_prompt():
    return {"prompt": generate_writing_prompt()}

@app.post("/api/tests/writing/evaluate")
def post_writing_evaluate(text: str = Body(..., embed=True)):
    return evaluate_writing(text)  

@app.get("/api/tests/level")
def get_level_test():
    return generate_level_test()

@app.post("/api/tests/level/evaluate")
def post_level_evaluate(answers: dict = Body(...)):
    return evaluate_level_test(answers)


@app.post("/request-password-reset")
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    print('request',request)
    # Находим пользователя по email
    user = db.query(User).filter(User.email == request.email).first()
    print('user',user)
    
    # Даже если пользователь не найден, отправляем одинаковый ответ
    # для предотвращения утечки информации
    if user:
        # Генерируем токен
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=30)

        # Создаем запись токена
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at
        )
        db.add(reset_token)
        db.commit()
        
        # Формируем ссылку для сброса
        reset_link = f"{base_url}/reset-password?token={token}"
        
        # Отправляем email
        email_body = f"""
        Здравствуйте!
        
        Вы запросили сброс пароля. Для создания нового пароля перейдите по ссылке:
        {reset_link}
        
        Ссылка действительна в течение 30 минут.
        
        Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
        """
        
        try:
            sendEmail(
                subject="Сброс пароля",
                body=email_body,
                to_email=request.email,
                from_email='catcheckrobot@gmail.com'
            )
        except Exception as e:
            # Логируем ошибку, но не сообщаем пользователю
            print(f"Ошибка отправки email: {e}")
    
    return {
        "message": "Если указанный email зарегистрирован в системе, "
                  "вам будет отправлено письмо с инструкциями по сбросу пароля"
    }

@app.post("/reset-password")
async def reset_password(
    request: PasswordReset,
    db: Session = Depends(get_db)
):
    # Находим токен
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_token:
        raise HTTPException(
            status_code=400,
            detail="Недействительная или истекшая ссылка для сброса пароля"
        )
    
    # Находим пользователя
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Хешируем новый пароль
    hashed_password = pwd_context.hash(request.new_password)
    
    # Обновляем пароль
    user.hashed_password = hashed_password
    
    # Помечаем токен как использованный
    reset_token.used = True
    
    # Сохраняем изменения
    db.commit()
    
    return {"message": "Пароль успешно изменен"}