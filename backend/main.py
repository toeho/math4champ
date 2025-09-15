from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
import os
from dotenv import load_dotenv
import uvicorn
from llm_prompt import load_prompt  # prompt loader
import yaml
import os

load_dotenv()
GEMINI_API = os.getenv("GENAI_API")

if not GEMINI_API:
    raise RuntimeError("❌ Error loading the API key from .env file")

client = genai.Client(api_key=GEMINI_API)
app = FastAPI()


def load_filled_prompt(filename: str, question: str, key: str = "prompt") -> str:

    if not os.path.isabs(filename):
        path = os.path.join(os.path.dirname(__file__), filename)
    else:
        path = filename

    if not os.path.isfile(path):
        raise FileNotFoundError(f"YAML file not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if key not in data:
        raise ValueError(f"{key}' key not found in YAML")

    prompt_template = data[key]

    filled_prompt = prompt_template.replace("{{problem}}", question)

    return filled_prompt




class Question(BaseModel):
    question: str

@app.post("/tutor")
async def tutor_endpoint(q: Question):
    try:
       
        system_prompt = load_prompt("class1_prompt.yaml")

        prompt = f"{system_prompt}\nUser: {q.question}\nAI:"

        response = client.models.generate_content(
            model="gemma-3-27b-it",
            contents=prompt
        )

        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
