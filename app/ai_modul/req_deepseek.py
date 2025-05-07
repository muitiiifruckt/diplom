import requests
import json

url = "http://localhost:11434/api/generate"
headers = {"Content-Type": "application/json"}
payload = {
    "model": "deepseek-r1:7b",
    "prompt": "[INST] why is the sky blue? [/INST]",
    "stream": False,
    "options": {
        "num_predict": 150,     # Уменьшить количество генерируемых токенов
        "temperature": 0.3,     # Более детерминированные ответы (0.1-1.0)
        "top_k": 10,            # Ограничить выбор топ-K токенов
        "top_p": 0.8,           # Использовать nucleus sampling
        "repeat_penalty": 1.5,  # Сильнее штрафовать повторы
        "num_threads": 8,       # Использовать больше ядер CPU
        "num_batch": 512,       # Увеличить размер пакета обработки
        "mirostat": 2           # Включить алгоритм оптимизации
    }
}

# Send request
response = requests.post(url, headers=headers, data=json.dumps(payload))

# Check if the request was successful
if response.status_code == 200:
    try:
        # Parse the JSON response
        response_data = response.json()
        
        # Extract and print the 'response' field
        if 'response' in response_data:
            print(response_data['response'])
        else:
            print("No 'response' field found in the data.")
    
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
else:
    print(f"Error: {response.status_code}, {response.text}")
