from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, List
import base64
from google import genai
from google.genai import types

client = genai.Client(api_key="AIzaSyDt6D-1Ss-cJhLGfNhfOTwtjvks1ynQ8ac")

app = FastAPI()

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