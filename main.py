import requests
import json

url = "http://localhost:11434/api/generate"
headers = {"Content-Type": "application/json"}
payload = {
    "model": "deepseek-r1:7b",
    "prompt": "Why is the sky blue?",
    "stream": False
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
