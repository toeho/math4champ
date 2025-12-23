from fastapi import APIRouter, HTTPException
import json
import os
import random


router = APIRouter(prefix="/quotes", tags=["Quotes"])


def load_quotes():
    """Load quotes from the JSON file."""
    quotes_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "quotes.json")
    try:
        with open(quotes_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Quotes file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in quotes file")


@router.get("/random", summary="Get a random quote")
async def get_random_quote():
    """
    Returns a randomly selected quote from the collection.
    
    The quote includes the text, author, and topic.
    """
    quotes = load_quotes()
    if not quotes:
        raise HTTPException(status_code=404, detail="No quotes available")
    
    random_quote = random.choice(quotes)
    return random_quote


@router.get("/", summary="Get all quotes")
async def get_all_quotes():
    """
    Returns all quotes in the collection.
    
    This endpoint returns the entire collection of quotes.
    """
    quotes = load_quotes()
    return {"quotes": quotes}


@router.get("/by-topic/{topic}", summary="Get quotes by topic")
async def get_quotes_by_topic(topic: str):
    """
    Returns all quotes related to a specific topic.
    
    Topics can be 'education', 'motivation', or 'math'.
    """
    quotes = load_quotes()
    filtered_quotes = [quote for quote in quotes if quote.get("topic", "").lower() == topic.lower()]
    
    if not filtered_quotes:
        raise HTTPException(status_code=404, detail=f"No quotes found for topic: {topic}")
    
    return {"quotes": filtered_quotes}