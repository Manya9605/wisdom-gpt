from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os
import re

app = FastAPI()

class QueryRequest(BaseModel):
    question: str

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

def clean_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r'^(meaning|answer|response)\s*:\s*', '', text, flags=re.I).strip()
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return "\n".join(lines[:10]).strip()

@app.get("/")
def root():
    return {"message": "backend works"}

@app.post("/ask")
def ask(req: QueryRequest):
    from backend.db.pipeline import getgitacontext

    context = getgitacontext(req.question)

    messages = [
        {
            "role": "system",
            "content": (
                "You are Wisdom GPT, a compassionate Bhagavad Gita-based life advisor. "
                "Give practical, calming, honest advice. "
                "Do not quote long verses. "
                "Do not mention raw context. "
                "Reply in simple Hinglish or simple English. "
                "Answer in 3 to 10 short lines. "
                "Focus on the user's emotion and next right action."
            )
        },
        {
            "role": "user",
            "content": f"""
User question:
{req.question}

Relevant Bhagavad Gita context:
{context}

Give the final answer only.
"""
        }
    ]

    completion = client.chat.completions.create(
        model="meta-llama/Llama-3.1-8B-Instruct:cerebras",
        messages=messages,
        temperature=0.7,
        max_tokens=220
    )

    answer = completion.choices[0].message.content or ""
    answer = clean_text(answer)

    if not answer:
        answer = (
            "Aap jo feel kar rahe ho, woh valid hai.\n"
            "Abhi ka best step hai shaant hokar sach aur zimmedari ke saath baat karna.\n"
            "Bhagavad Gita ki spirit yahi sikhati hai ki galti ke baad sudhaar zaroori hota hai.\n"
            "Ek honest conversation karo aur aage ke liye better choice lo."
        )

    return {
        "question": req.question,
        "answer": answer
    }