import yaml
import os

def load_prompt(filename: str = "class1_prompt.yaml"):
    """
    Load YAML prompt file and return the 'system' section as string.
    """
    path = os.path.join(os.path.dirname(__file__), filename)
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if "system" not in data:
        raise ValueError("❌ 'system' key not found in prompt YAML")

    return data["system"]
