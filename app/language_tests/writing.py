
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.req_gemma import request_gemma2

def generate_writing_prompt():
    prompt = """
    Suggest a topic for a short story or essay for an English learner. 
    Return only the topic as a string, no explanations.
    """
    response = request_gemma2(prompt)
    return response.strip()
def evaluate_writing(user_text):
    prompt = f"""
    Analyze the following English text for syntax and grammar. 
    Give a percentage score from 0 (A0 level) to 100 (C2 level), where 0 means very poor and 100 means perfect native-like writing.
    Also, briefly explain the main mistakes or strengths.
    Return a JSON object with keys: "score" (integer 0-100), "level" (A0, A1, A2, B1, B2, C1, C2), and "feedback" (short text).
    Text:
    {user_text}
    Only return the JSON, no explanations.
    """
    response = request_gemma2(prompt)
    return response

if __name__ == "__main__":
    # 1. Получить тему
    topic = generate_writing_prompt()
    print("Write a short story about:", topic)
    # 2. (Пользователь пишет текст, например, через input)
    user_text = input("Enter your story:\n")
    # 3. Оценить текст
    result = evaluate_writing(user_text)
    print("\nEvaluation result:")
    print(result)
