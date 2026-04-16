import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.db.pipeline import build_vector_db

if __name__ == "__main__":
    build_vector_db()