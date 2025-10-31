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


# def check_answer(question: str, answer: str, context: str = "", class_topics: str | None = None) -> dict:
#     """Ask the LLM to judge whether the student's answer is final/correct.

#     Returns a dict: {"correct": bool, "feedback": str, "correct_answer": Optional[str], "final": bool}
#     """
#     system_prompt = load_prompt_for_class(5)
#     topic_text = f"\nClass topics: {class_topics}" if class_topics else ""
#     user_content = f"Question: {question}\nStudent answer: {answer}\nContext: {context}{topic_text}\nRespond with JSON: {""}" + "{\"correct\": <true/false>, \"feedback\": \"...\", \"correct_answer\": \"...\", \"final\": <true/false>}"

#     messages = [
#         system_prompt,
#         {"role": "user", "content": [{"type": "text", "text": user_content}]},
#     ]
#     try:
#         response = completion(model=MODEL_NAME, messages=messages, api_key=API_KEY)
#         content = response["choices"][0]["message"]["content"].strip()
#         # Try to extract JSON from the model output
#         import re, json as _json

#         m = re.search(r"\{.*\}", content, re.S)
#         if m:
#             parsed = _json.loads(m.group(0))
#             return parsed
#         # Fallback: simple heuristics
#         lower = content.lower()
#         correct = "correct" in lower and "incorrect" not in lower
#         return {"correct": correct, "feedback": content, "correct_answer": None, "final": True}
#     except Exception as e:
#         return {"correct": False, "feedback": f"LLM error: {e}", "correct_answer": None, "final": False}


def generate_hint(question: str,  last_context: str = "", image_b64 :str | None = None, user_class: int | str | None = None ) -> str:
    """Generate a concise hint using a class-specific prompt.

    Args:
        question: The student's question text.
        last_context: Recent chat context to include.
        image_b64: Optional base64 PNG image string.
        user_class: Class level (int like 5 or string like 'class_5' or '5').

    Returns:
        The LLM's reply string.
    """

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
    


# def check_answer(conversation=None, question=None, answer=None, context=None, class_topics=None):
#     """
#     Analyze the latest user + AI conversation to determine:
#       1. Whether the student's message is a FINAL answer.
#       2. If final, whether the answer is correct.

#     Returns:
#       {
#         "final": bool,
#         "correct": bool,
#         "feedback": str,
#         "correct_answer": str
#       }
#     """

#     # --- Backward compatibility: older calls may use question/answer ---
#     if conversation is None:
#         conversation = []
#         if question:
#             conversation.append({"role": "assistant", "content": question})
#         if answer:
#             conversation.append({"role": "user", "content": answer})
#         if context:
#             conversation.append({"role": "system", "content": f"Context: {context}"})

#     # --- Build prompt ---
#     system_prompt = f"""
# You are an AI evaluator for a tutoring chat. 
# Your job is to analyze the entire conversation between a student and a tutor AI and judge the *student's latest message only*.

# Steps you must follow strictly:

# 1. Look at the **student's most recent message** (the last `user` role message in the conversation).
# 2. Decide whether that message is a **final answer** — i.e., the student is clearly giving the answer, not asking a question, thinking aloud, or saying "I think".
# 3. If it is final, decide whether the answer is **correct**, based on the context of the conversation and class topics.

# ### Context / topics
# {class_topics or "N/A"}

# ### Output Format
# You must respond with a **valid JSON object only**, like this:
# {{
#   "final": true or false,
#   "correct": true or false,
#   "feedback": "short reasoning (1–2 lines) about the correctness",
#   "correct_answer": "the right answer if student's is wrong, else repeat correct one"
# }}

# Be strict about output formatting — no explanations outside the JSON.
# Example:
# {{
#   "final": true,
#   "correct": true,
#   "feedback": "The student correctly stated that 0! = 1.",
#   "correct_answer": "1"
# }}
# """


#     try:
#         response = completion(
#             model="gpt-4o-mini",   # or any model you configured
#             messages=[
#                 {"role": "system", "content": system_prompt},
#                 *conversation
#             ],
#             temperature=0.2,
#             max_tokens=300,
#         )

#         text = response["choices"][0]["message"]["content"].strip()

#         # Clean up any markdown-style JSON output
#         if text.startswith("```json"):
#             text = text.replace("```json", "").replace("```", "").strip()
#         elif text.startswith("```"):
#             text = text.replace("```", "").strip()

#         # Parse JSON safely
#         result = json.loads(text)
#         return result

#     except Exception as e:
#         print("⚠️ check_answer error:", e)
#         return {"final": False, "correct": False, "feedback": "Error or invalid JSON"}

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

    # --- Build the system prompt ---
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
            api_key=API_KEY
        )

        text = response["choices"][0]["message"]["content"].strip()

        # --- Clean up markdown wrappers like ```json ... ``` ---
        if text.startswith("```"):
            text = text.strip("`").replace("json", "").strip()

        # Extract JSON only
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            text = match.group(0)

        result = json.loads(text)
        return result

    except Exception as e:
        print("⚠️ check_answer error:", e)
        return {"final": False, "correct": False, "feedback": "Error or invalid JSON"}