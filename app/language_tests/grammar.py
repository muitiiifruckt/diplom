
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.ai_modul.req_gemma import request_gemma2
import json
def generate_grammar_test(num_sentences=5):
    prompt = f"""
    Create a grammar test with {num_sentences} sentences.
    For each sentence:
    - Use exactly one [blank] in a different place each time (not always at the start).
    - The [blank] should replace only one word in the sentence.
    - Provide the correct answer for the blank (only one word).
    - Provide three plausible but incorrect answers (distractors) for the blank.
    Format the response as a JSON list, where each item is an object with keys:
    "sentence", "answer", "distractors".
    Example:
    [
      {{
        "sentence": "The cat is [blank] on the couch.",
        "answer": "sleeping",
        "distractors": ["sitting", "jumping", "eating"]
      }},
      {{
        "sentence": "She went to the [blank] yesterday.",
        "answer": "store",
        "distractors": ["park", "school", "office"]
      }}
    ]
    Only return the JSON, no explanations.
    """
    response = request_gemma2(prompt)
    print('response',response)
    # Преобразуем ответ в Python-объект
    data = json.loads(response) 
    return data 

if __name__ == "__main__":
    # Example usage
    test = generate_grammar_test()
    print("\nGenerated Grammar Test:")
    print(test)

