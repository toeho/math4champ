import requests
import sys
import json
import time
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"  # ensure FastAPI is running


def pretty(data):
    try:
        return json.dumps(data, indent=2)
    except Exception:
        return str(data)


def require_server():
    try:
        r = requests.get(BASE_URL, timeout=3)
        return True
    except requests.exceptions.RequestException:
        return False


def main():
    if not require_server():
        print("❌ FastAPI server not running at", BASE_URL)
        sys.exit(1)

    # Unique teacher username for this run
    username = f"teacher_{int(time.time())}"
    password = "pass1234"

    print("\n--- Teacher: register ---")
    reg_payload = {
        "username": username,
        "password": password,
        "name": "Test Teacher",
        "email": f"{username}@example.com",
        "bio": "Automated test teacher",
    }
    r = requests.post(f"{BASE_URL}/teachers/register", json=reg_payload)
    print("register:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code not in (200, 201):
        print("❌ register failed")
        sys.exit(2)
    teacher_id = r.json()["id"]

    print("\n--- Teacher: login ---")
    login_payload = {"username": username, "password": password}
    r = requests.post(f"{BASE_URL}/teachers/login", json=login_payload)
    print("login:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code != 200 or "access_token" not in r.json():
        print("❌ login failed")
        sys.exit(3)
    token = r.json()["access_token"]
    auth = {"Authorization": f"Bearer {token}"}

    print("\n--- Teacher: upload video ---")
    params = {
        "title": "Algebra Basics",
        "class_level": "class_6",
        "description": "Intro to Algebra",
        "subject": "Math",
    }
    # Tiny placeholder mp4 content; server validates extension, not codec
    files = {"file": ("sample.mp4", b"\x00\x00\x00\x00", "video/mp4")}
    r = requests.post(
        f"{BASE_URL}/teachers/videos/upload",
        params=params,
        files=files,
        headers=auth,
    )
    print("upload:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code != 200:
        print("❌ upload failed")
        sys.exit(4)
    video_id = r.json()["video_id"]

    print("\n--- Student: list teachers by class ---")
    r = requests.get(f"{BASE_URL}/teachers/class/class_6")
    print("teachers by class:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code != 200:
        print("❌ list teachers failed")
        sys.exit(5)
    teacher_ids = [t["id"] for t in r.json()]
    if teacher_id not in teacher_ids:
        print("❌ uploaded teacher not found in class list")
        sys.exit(6)

    print("\n--- Student: list teacher's videos for class ---")
    r = requests.get(f"{BASE_URL}/teachers/by-teacher/{teacher_id}/class/class_6")
    print("teacher videos:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code != 200:
        print("❌ list teacher videos failed")
        sys.exit(7)

    print("\n--- Student: get video details (increments views) ---")
    r = requests.get(f"{BASE_URL}/teachers/videos/{video_id}")
    print("video details:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code != 200:
        print("❌ get video failed")
        sys.exit(8)

    print("\n--- Student: get stream info ---")
    r = requests.get(f"{BASE_URL}/teachers/videos/stream/{video_id}")
    print("stream info:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code != 200:
        print("❌ stream info failed")
        sys.exit(9)
    fp = r.json().get("file_path", "")
    if not fp.startswith("/uploads/videos/"):
        print("❌ unexpected file_path:", fp)
        sys.exit(10)

    # Optional: HEAD request to the static file
    head = requests.get(BASE_URL + fp)
    print("static file check:", head.status_code)

    print("\n--- Cleanup: delete video ---")
    r = requests.delete(f"{BASE_URL}/teachers/videos/{video_id}", headers=auth)
    print("delete:", r.status_code, pretty(r.json() if r.headers.get('content-type','').startswith('application/json') else r.text))
    if r.status_code != 200:
        print("❌ delete failed (manual cleanup may be needed)")
        sys.exit(11)

    print("\n✅ Teacher module basic flow works")
    sys.exit(0)


if __name__ == "__main__":
    main()
