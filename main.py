from help import recognize_speech
from req_gemma import request_gemma2
from to_audio import say_text


text = recognize_speech()
print(f"text  = {text}")
answer = request_gemma2(text)
print(f"answer =  {answer}")
say_text(answer)