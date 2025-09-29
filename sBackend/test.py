import requests
import json
import random

BASE_URL = "http://127.0.0.1:8000"

def create_session():
    resp = requests.post(f"{BASE_URL}/session")
    print("Create Session Response:", resp.json())
    return resp.json()["sessionId"]

def send_message(session_id, message, is_image=False, image=None):
    payload = {
        "sessionId": session_id,
        "message": message,
        "isImage": is_image,
        "image": image
    }
    resp = requests.post(f"{BASE_URL}/chat", json=payload)
    print("Chat Response:", resp.json())

def get_context(session_id):
    payload = {"sessionId": session_id}
    resp = requests.post(f"{BASE_URL}/context", json=payload)
    print("Context Response:", resp.json())

def load_image_from_json(file_path="image.json"):
    with open(file_path, "r") as f:
        data = json.load(f)
    return data.get("base")  # 'base' key from JSON

if __name__ == "__main__":
    # Load image once
    image_base64 = load_image_from_json("image.json")

    # 1. Create a new session
    session_id = create_session()

    # 2. Prepare jumbled messages
    messages = [
        "Hello Gemini",
        "What am I doing?",
        "Check this image",
        "Can you help me?",
        "Tell me a story"
    ]
    random.shuffle(messages)

    # 3. Send 5 messages
    for msg in messages:
        if "image" in msg.lower():
            send_message(session_id, msg, is_image=True, image=image_base64)
        else:
            send_message(session_id, msg)

    # 4. Retrieve context
    get_context(session_id)
