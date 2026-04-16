import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.db.pipeline import get_gita_context

question = "What does the Gita say about anger?"
context = get_gita_context(question)

print("\n--- Retrieved Context ---")
print(context)