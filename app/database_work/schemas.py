from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
class WordRequest(BaseModel):
    word: str