import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.req_gemma import request_gemma2

def generate_reading_test(num_sentences=5, num_questions=5):
    prompt = f"""
    Create a short story or description in English consisting of {num_sentences} sentences. 
    After the story, generate {num_questions} questions about the story's content.
    For each question:
    - Provide the question as "question".
    - Provide the correct answer as "answer".
    - Provide three plausible but incorrect answers as "distractors".
    Format the response as a JSON object with two keys:
    "story": the story as a single string,
    "questions": a list of question objects, each with "question", "answer", "distractors".
    Example:
    {{
      "story": "Tom went to the park. He saw a dog. The dog was playing with a ball. Tom smiled and watched the dog. Then he went home.",
      "questions": [
        {{
          "question": "Where did Tom go?",
          "answer": "To the park",
          "distractors": ["To the school", "To the shop", "To the zoo"]
        }},
        {{
          "question": "What was the dog playing with?",
          "answer": "A ball",
          "distractors": ["A stick", "A cat", "A frisbee"]
        }}
      ]
    }}
    Only return the JSON, no explanations.
    """
    response = request_gemma2(prompt)
    print('response',response)
    # Преобразуем ответ в Python-объект
    data = json.loads(response)
    return data

if __name__ == "__main__":
    test = generate_reading_test()
    print("\nGenerated Reading Test:")
    print(test)