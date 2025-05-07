from app.audio_to_text import recognize_speech
from app.ai_modul.req_gemma import request_gemma2
from app.text_to_audio import say_text

while True:
    text = recognize_speech()
    print(f"text  = {text}")
    answer = request_gemma2(text)
    print(f"answer =  {answer}")
    say_text(answer)
    
