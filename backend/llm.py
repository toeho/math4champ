import os
import json
from dotenv import load_dotenv
from litellm import completion


load_dotenv()

MODEL_NAME = "gemini/gemini-2.0-flash"  # format for LiteLLM Gemini
API_KEY = os.getenv("GEMINI_API_KEY")




def load_prompt_for_class(class_number: int) -> dict:
    
    file_path = f"prompts/two.json"
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_hint(question: str,  last_context: str = "", image_b64 :str | None = None ) -> str:
    prompt = f"""
Student question: {question}
Previous context: {last_context}
Respond concisely.
"""
    system_prompt=load_prompt_for_class(5)

    # Build message content
    content = [
        {"type": "text", "text": f"Student question: {question}\nPrevious context: {last_context}\nRespond concisely."}
    ]

    # If an image is provided, attach it
    if image_b64:
        # Wrap in data URL format required by Gemini
        image_data_url = f"data:image/png;base64,{image_b64}"
        content.append({"type": "image_url", "image_url": image_data_url})

    # Build final messages
    messages = [
        system_prompt,
        {"role": "user", "content": content}
    ]
    response = completion(
        model=MODEL_NAME,
        messages=messages,
        api_key=API_KEY,
    )

    return response["choices"][0]["message"]["content"].strip()



def get_chat_title(text: str) -> str:
    
    try:
        messages = [
            {"role": "system", "content": "Generate an appropriate title for this message to be saved as chat title in the database, it will have more messages from user and llm, give most appropriate title in very short 3 or 4 words"},
            {"role": "user", "content": text}
        ]
        response = completion(
            model=MODEL_NAME,
            messages=messages,
            api_key=API_KEY,
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"Error: {str(e)}"