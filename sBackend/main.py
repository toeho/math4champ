from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
import base64
from google import genai
from google.genai import types
from fastapi.middleware.cors import CORSMiddleware

client = genai.Client(api_key="AIzaSyDt6D-1Ss-cJhLGfNhfOTwtjvks1ynQ8ac")

app = FastAPI()

# Allow CORS so the frontend (vite) can call this backend. In dev it's common to
# allow all origins; tighten this in production if needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    sessionId: int
    message: str
    image: Optional[str] = None  # Base64-encoded image string
    isImage: bool = False

class ContextRequest(BaseModel):
    sessionId: int


session_contexts: Dict[int, List[str]] = {}
session_counter = 100

@app.post("/session")
async def create_session():
    global session_counter
    session_counter += 1
    session_contexts[session_counter] = []
    return {"sessionId": session_counter, "message": "New session created"}

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        if req.sessionId not in session_contexts:
            return {"error": "Invalid sessionId. Please create a session first."}

        session_contexts[req.sessionId].append(req.message)
        session_contexts[req.sessionId] = session_contexts[req.sessionId][-3:]

        context_text = "\n".join(session_contexts[req.sessionId])
        prompt = f"Conversation history:\n{context_text}\nUser: {req.message}"

        if req.isImage and req.image:
            image_bytes = base64.b64decode(req.image)
            contents = [
                {"inlineData": {"mimeType": "image/jpeg", "data": image_bytes}},
                {"text": prompt}
            ]
        else:
            contents = [{"text": prompt}]

        response = client.models.generate_content(
            model="gemma-3-27b-it",
            contents=contents
        )

        return {
            "sessionId": req.sessionId,
            "last_3_messages": session_contexts[req.sessionId],
            "answer": response.text
        }

    except Exception as e:
        return {"error": str(e)}


class QuestionsChatRequest(BaseModel):
    # Accept either `prompt` (text) or `image` (base64 string) with optional mime
    prompt: Optional[str] = None
    image: Optional[str] = None
    mime: Optional[str] = None


@app.post("/questions/chatid")
async def questions_chat(req: QuestionsChatRequest):
    """
    Accepts JSON like { prompt } or { image, mime } and returns { reply }.
    This mirrors the /chat logic but uses the requested path.
    """
    try:
        # Build prompt/content
        if req.image:
            # strip possible data URL prefix
            img_str = req.image
            if img_str.startswith("data:"):
                img_str = img_str.split(",", 1)[1]
            try:
                image_bytes = base64.b64decode(img_str)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid base64 image data")

            contents = [
                {"inlineData": {"mimeType": req.mime or "image/jpeg", "data": image_bytes}},
                {"text": req.prompt or ""}
            ]
        else:
            contents = [{"text": req.prompt or ""}]

        response = client.models.generate_content(
            model="gemma-3-27b-it",
            contents=contents
        )

        # Return a normalized reply field for the frontend
        return {"reply": getattr(response, "text", None) or response}
    except HTTPException:
        raise
    except Exception as e:
        return {"error": str(e)}


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/login")
async def login(req: LoginRequest):
    """
    Simple mock login endpoint. In production replace with real auth.
    Returns access_token and user object.
    """
    # For demo accept any username/password — return a fake token and user payload
    token = f"mock-token-{req.username}"
    user = {"username": req.username, "name": req.username}
    return {"access_token": token, "token": token, "token_type": "bearer", "user": user}


@app.post("/context")
async def get_context(req: ContextRequest):
    """
    Retrieve the last 3 messages (context) for a given sessionId.
    """
    if req.sessionId not in session_contexts:
        return {"error": "Invalid sessionId. No context found."}
    
    return {
        "sessionId": req.sessionId,
        "last_3_messages": session_contexts[req.sessionId]
    }