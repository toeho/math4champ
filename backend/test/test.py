import requests
import sys
import json

BASE_URL = "http://127.0.0.1:8000"  # make sure FastAPI is running

# Global vars to reuse IDs
USER_USERNAME = "satyam"
USER_PASSWORD = "1234"
CHAT_ID = None


def pretty(res):
    """Safe JSON printer"""
    try:
        return json.dumps(res.json(), indent=2)
    except Exception:
        return res.text


def test_user_endpoints():
    print("\n--- User Endpoints ---")

    # Signup
    signup_payload = {"username": USER_USERNAME, "name": "Satyam Pathak", "password": USER_PASSWORD}
    r = requests.post(f"{BASE_URL}/users/signup", json=signup_payload)
    print("Signup:", r.status_code, pretty(r))

    # Login
    login_payload = {"username": USER_USERNAME, "password": USER_PASSWORD}
    r = requests.post(f"{BASE_URL}/users/login", json=login_payload)
    print("Login:", r.status_code, pretty(r))

    # Get user
    r = requests.get(f"{BASE_URL}/users/me", params={"username": USER_USERNAME})
    print("Get User:", r.status_code, pretty(r))

    # Update user
    update_payload = {"name": "Satyam P.", "password": "5678"}
    r = requests.put(f"{BASE_URL}/users/update", params={"username": USER_USERNAME}, json=update_payload)
    print("Update User:", r.status_code, pretty(r))


def test_chat_endpoints():
    global CHAT_ID
    print("\n--- Chat Endpoints ---")

    # Send message
    msg_payload = {"text": "Hello bot!", "sender": "user"}
    r = requests.post(f"{BASE_URL}/chat/send", json=msg_payload)
    print("Send Message:", r.status_code, pretty(r))

    if r.status_code == 200:
        CHAT_ID = r.json().get("id")


def test_history_endpoints():
    print("\n--- History Endpoints ---")

    r = requests.get(f"{BASE_URL}/history/")
    print("Get History:", r.status_code, pretty(r))


def test_explore_endpoints():
    print("\n--- Explore Endpoints ---")

    r = requests.get(f"{BASE_URL}/explore/")
    print("Get Explore Data:", r.status_code, pretty(r))


if __name__ == "__main__":
    try:
        requests.get(BASE_URL)  # quick check if server is up
    except requests.exceptions.ConnectionError:
        print("❌ FastAPI server not running at", BASE_URL)
        sys.exit(1)

    test_user_endpoints()
    test_chat_endpoints()
    test_history_endpoints()
    test_explore_endpoints()
