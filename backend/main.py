from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os
import re
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

def get_client():
    return OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=os.environ["HF_TOKEN"],
    )

def clean_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r'^(meaning|answer|response)\s*:\s*', '', text, flags=re.I).strip()
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text

@app.get("/")
def root():
    return {"message": "backend works"}

@app.post("/ask")
def ask(req: QueryRequest):
    from backend.db.pipeline import getgitacontext

    context = getgitacontext(req.question)
    client = get_client()

    messages = [
        {
            "role": "system",
            "content": (
    "You are a wise but very practical and human life advisor inspired by Acharya Prashant.\n\n"

    "IMPORTANT:\n"
    "- Talk like a real person, not like a philosopher or guru\n"
    "- Use very simple and clear English\n"
    "- Avoid heavy words like 'ego', 'rajasic', 'divine', 'illusion'\n"
    "- Make the answer easy enough for a 15-year-old to understand\n\n"

    "Your style:\n"
    "- Honest and real\n"
    "- Calm but direct\n"
    "- Like a friend explaining something important\n\n"

    "Structure:\n"
    "1. Start by understanding what the person is feeling\n"
    "2. Explain the real reason behind it in simple terms\n"
    "3. Give 1 real-life elaborated example (very relatable) if relevant\n"
    "4. End with 1-2 practical steps\n\n"

    "Do NOT sound preachy.\n"
    "Do NOT give lectures.\n"
    "Do NOT use complicated philosophy.\n\n"

    "Bhagavad Gita usage:\n"
    "- Use a verse ONLY if it clearly fits the situation\n"
    "- Do NOT force a verse\n"
    "- If unsure, skip the verse completely\n"
    "- Never make up or paraphrase incorrect quotes\n"
    "- If you include a verse, keep it short and relevant\n\n"

    "Length: 50-60 lines."
)
        },
        {
            "role": "user",
            "content": f"""
User question:
{req.question}

Relevant Gita insight:
{context}

Give the final answer now following the structure strictly.
"""
        }
    ]

    completion = client.chat.completions.create(
        model="meta-llama/Llama-3.1-8B-Instruct:cerebras",
        messages=messages,
        temperature=0.9,   # 🔥 increased for better depth
        max_tokens=250
    )

    answer = completion.choices[0].message.content or ""
    answer = clean_text(answer)

    # Clean line formatting
    lines = [line.strip() for line in answer.splitlines() if line.strip()]
    answer = "\n".join(lines[:10])

    return {
        "question": req.question,
        "answer": answer
    }