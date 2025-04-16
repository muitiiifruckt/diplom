from sqlalchemy import Column, Integer, String
from database import Base
from database import engine
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True)
    word = Column(String, unique=True, index=True)
    translation = Column(String)

Base.metadata.create_all(bind=engine)