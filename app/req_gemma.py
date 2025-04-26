import requests
import json




def request_gemma2(request_text = "lol kek"):
    url = "http://localhost:11434/api/generate"
    headers = {"Content-Type": "application/json"}
    payload = {
        "model": "gemma2:2b",
        "prompt": f"{request_text}",
        "stream": False,

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
                return response_data['response']
            else:
                print("No 'response' field found in the data.")
        
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
    else:
        print(f"Error: {response.status_code}, {response.text}")
if __name__ ==("__main__"):
    print(request_gemma2("create a prompt to generate a photo so that a person can guess the word from its picture, return only the prompt itself in response, the maximum response size is 77 tokens. word - cheese"))