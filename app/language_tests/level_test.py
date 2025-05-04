import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.req_gemma import request_gemma2
from app.language_tests.grammar import generate_grammar_test
from app.language_tests.vocabulary import generate_vocabulary_test
from app.language_tests.reading import generate_reading_test
from app.language_tests.listening import generate_listening_test
from app.language_tests.writing import generate_writing_prompt
import re
def evaluate_level_test(user_answers):
    prompt = f"""
    The user completed an English level test. Here are their answers:
    {user_answers}
    Please analyze their answers for grammar, vocabulary, reading, listening, and writing.
    Give a total score (0-100), a CEFR level (A0-C2), and a short feedback for each section and overall.
    Return a JSON with keys: "score", "level", "feedback", "section_feedback".
    Only return the JSON, no explanations, no markdown, no comments.
    """
    response = request_gemma2(prompt)
    print("LLM RESPONSE:", repr(response))  # Диагностика

    # Удаляем markdown-обёртку, если есть
    cleaned = re.sub(r"^```json|^```|```$", "", response.strip(), flags=re.MULTILINE).strip()
    try:
        data = json.loads(cleaned)
    except Exception as e:
        print("Ошибка парсинга JSON:", e)
        print("Исходный ответ:", repr(response))
        data = {"error": "LLM did not return valid JSON", "raw": response}
    return data
def generate_level_test():
    # Можно использовать уже существующие генераторы
    grammar = generate_grammar_test(2)
    vocabulary = generate_vocabulary_test(2)
    reading = generate_reading_test(2, 1)
    listening = generate_listening_test(2)
    writing_prompt = generate_writing_prompt()
    return {
        "grammar": grammar,
        "vocabulary": vocabulary,
        "reading": reading,
        "listening": listening,
        "writing_prompt": writing_prompt
    }