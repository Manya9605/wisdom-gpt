import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from backend.db.pipeline import get_gita_context

print(get_gita_context("What does the Gita say about anger?"))