import os
import json, re
from dotenv import load_dotenv
from litellm import completion


load_dotenv()

MODEL_NAME = "gemini/gemini-2.0-flash"  # format for LiteLLM Gemini
API_KEY = os.getenv("GEMINI_API_KEY")




def load_prompt_for_class(class_number: int) -> dict:
    # Map class_number to a prompt file. Default to class_5 style prompt if not found.
    mapping = {
        1: "prompts/one.json",
        2: "prompts/two.json",
        3: "prompts/three.json",
        4: "prompts/four.json",
        5: "prompts/five.json",
    }
    file_path = mapping.get(class_number, "prompts/five.json")
    if not os.path.exists(file_path):
        # fallback: return a simple system prompt
        return {"role": "system", "content": {"type": "text", "text": "You are a helpful math tutor."}}
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)



def generate_hint(question: str,  last_context: str = "", image_b64 :str | None = None, user_class: int | str | None = None ) -> str:
    """Generate a concise hint using a class-specific prompt.
    Args:
        question: The student's question text.
        last_context: Recent chat context to include.
        image_b64: Optional base64 PNG image string.
        user_class: Class level (int like 5 or string like 'class_5' or '5').

    Returns:
        The LLM's reply string.    """

    # Normalize/parse user_class into an integer class number used by prompt loader
    def _class_to_number(c):
        if c is None:
            return 5
        try:
            if isinstance(c, int):
                return int(c)
            s = str(c).strip()
            if s.startswith("class_"):
                s = s.split("_", 1)[1]
            return int(s)
        except Exception:
            return 5

    class_number = _class_to_number(user_class)
    system_prompt = load_prompt_for_class(class_number)

    # Build message content and include the student class in the prompt
    content = [
        {
            "type": "text",
            "text": f"Student class: class_{class_number}\nStudent question: {question}\nPrevious context: {last_context}\nRespond concisely."
        }
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
    
def check_answer(conversation=None, question=None, answer=None, context=None, class_topics=None):

    """
    Evaluates if the student's last message is a final answer and whether it's correct.
    Uses LiteLLM to call Gemini (or any configured model).
    """

    # --- Build conversation if not provided ---
    if conversation is None:
        conversation = []
        if question:
            conversation.append({"role": "assistant", "content": question})
        if answer:
            conversation.append({"role": "user", "content": answer})
        if context:
            conversation.append({"role": "system", "content": f"Context: {context}"})

   
    system_prompt = f"""
You are an AI evaluator that analyzes tutoring chat transcripts.
Your job:
1. Look at the student's latest message (last 'user' role).
2. Decide if it is a *final answer*.
3. If it is final, check whether it is *correct* based on the conversation context.
### Class Topics
{class_topics or "N/A"}

### Output Format
Respond with **valid JSON only**, like this:
{{
  "final": true or false,
  "correct": true or false,
  "feedback": "short reasoning (1–2 lines)",
  "correct_answer": "the correct answer"
}}
"""

    try:
        response = completion(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                *conversation
            ],
            api_key=API_KEY,
            temperature=0.0,
            max_tokens=300,
        )

        text = response["choices"][0]["message"]["content"].strip()

        # Debug: log raw output so we can inspect failure cases
        print("🛈 check_answer raw output:", repr(text[:2000]))

        # Remove fenced code blocks (```json ... ``` or ``` ... ```)
        m_code = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.S | re.I)
        if m_code:
            text = m_code.group(1).strip()

        # If still not obviously JSON, try to extract the first {...} block
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            text = match.group(0)
        else:
            # Fallback: try substring from first '{' to last '}' if present
            first = text.find('{')
            last = text.rfind('}')
            if first != -1 and last != -1 and last > first:
                text = text[first:last+1]

        text = text.strip()

        # Try direct JSON parse first
        try:
            result = json.loads(text)
            return result
        except Exception as e:
            # Attempt common sanitizations and retry
            san = text
            # Replace single quotes with double quotes when appropriate
            if san.count("'") > san.count('"'):
                san = san.replace("'", '"')
            # Replace Python booleans/None to JSON equivalents
            san = re.sub(r"\bTrue\b", "true", san)
            san = re.sub(r"\bFalse\b", "false", san)
            san = re.sub(r"\bNone\b", "null", san)
            # Remove trailing commas before } or ]
            san = re.sub(r",\s*([}\]])", r"\1", san)

            try:
                result = json.loads(san)
                return result
            except Exception as e2:
                print("⚠️ check_answer parse retry failed:", e2)
                print("🛈 final sanitized attempt contents:", repr(san[:2000]))

        # If parsing ultimately failed, return a safe structured response with raw feedback
        return {"final": False, "correct": False, "feedback": "Error or invalid JSON", "raw": text}

    except Exception as e:
        print("⚠️ check_answer error:", e)
        return {"final": False, "correct": False, "feedback": "Error or invalid JSON"}