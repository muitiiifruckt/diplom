from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
class WordRequest(BaseModel):
    word: str
    
class PasswordResetRequest(BaseModel):
    email: EmailStr
    

class PasswordReset(BaseModel):
    token: str
    new_password: str