
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.req_gemma import request_gemma2
from app.to_audio import text_to_speech
import json

def generate_listening_test(num_sentences=5):
    prompt = f"""
    Create {num_sentences} independent English sentences (not a story, but separate descriptions).
    For each sentence:
    - Provide the sentence as "sentence".
    - Create a question about the content of the sentence as "question".
    - Provide the correct answer as "answer".
    - Provide three plausible but incorrect answers as "distractors".
    Format the response as a JSON list, where each item is an object with keys:
    "sentence", "question", "answer", "distractors".
    Example:
    [
      {{
        "sentence": "The cat is sleeping on the couch.",
        "question": "Where is the cat sleeping?",
        "answer": "On the couch",
        "distractors": ["On the bed", "On the floor", "On the chair"]
      }},
      {{
        "sentence": "Tom is reading a book in the park.",
        "question": "What is Tom doing in the park?",
        "answer": "Reading a book",
        "distractors": ["Playing football", "Walking his dog", "Eating lunch"]
      }}
    ]
    Only return the JSON, no explanations.
    """
    response = request_gemma2(prompt)
    # Преобразуем ответ в Python-объект
    data = json.loads(response)
    
    # Генерируем аудиофайлы для каждого предложения
    audio_files = []
    for idx, item in enumerate(data):
        filename = f"listening_{idx+1}.mp3"
        text_to_speech(item["sentence"], filename=filename, folder="send", lang='en')
        audio_files.append({
            "audio_url": f"/static/{filename}",
            "question": item["question"],
            "answer": item["answer"],
            "distractors": item["distractors"]
        })
    return audio_files

if __name__ == "__main__":
    test = generate_listening_test()
    print("\nGenerated Listening Test:")
    print(json.dumps(test, ensure_ascii=False, indent=2))