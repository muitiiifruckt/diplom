from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime
from database import engine, Base
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    chats = relationship("Chat", back_populates="user")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chats")
    message_pairs = relationship("ChatMessagePair", back_populates="chat", cascade="all, delete-orphan")


class ChatMessagePair(Base):
    __tablename__ = "chat_message_pairs"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))

    user_audio = Column(LargeBinary, nullable=True)
    user_transcript = Column(Text, nullable=True)

    bot_audio = Column(LargeBinary, nullable=True)
    bot_transcript = Column(Text, nullable=True)

    timestamp = Column(DateTime, default=datetime.utcnow)

    chat = relationship("Chat", back_populates="message_pairs")

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True)
    word = Column(String, unique=True, index=True)
    translation = Column(String)

Base.metadata.create_all(bind=engine)