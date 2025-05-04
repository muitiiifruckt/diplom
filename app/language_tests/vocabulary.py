
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.req_gemma import request_gemma2

def generate_vocabulary_test(num_words=5):
    prompt = f"""
    Create a vocabulary test with {num_words} English words.
    For each word:
    - Provide the word in English as "word".
    - Provide the correct Russian translation as "answer".
    - Provide three plausible but incorrect Russian translations as "distractors".
    Format the response as a JSON list, where each item is an object with keys:
    "word", "answer", "distractors".
    Example:
    [
      {{
        "word": "apple",
        "answer": "яблоко",
        "distractors": ["апельсин", "груша", "банан"]
      }},
      {{
        "word": "table",
        "answer": "стол",
        "distractors": ["стул", "окно", "дверь"]
      }}
    ]
    Only return the JSON, no explanations.
    """
    response = request_gemma2(prompt)
    return response

if __name__ == "__main__":
    test = generate_vocabulary_test()
    print("\nGenerated Vocabulary Test:")
    print(test)

