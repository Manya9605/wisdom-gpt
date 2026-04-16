import pandas as pd
import re
from backend.db.chroma import get_or_create_collection, get_collection

CSV_PATH = r"C:\Users\Manya\OneDrive\OfficeMobile\Documents\archive\Bhagwad_Gita (2).csv"

def build_clean_text(row):
    eng = str(row.get("EngMeaning", "")).strip()

    # Remove verse numbers like "1.1", "1.2"
    eng = re.sub(r'^\d+\.\d+\.*\s*', '', eng)

    # Remove character names like "Dhritarashtra said"
    eng = re.sub(r'^[A-Za-z\s]+said\s*', '', eng, flags=re.IGNORECASE)

    # Keep only meaningful lines (filter very short or weird ones)
    if len(eng.split()) < 6:
        return ""

    return eng

def build_vector_db():
    print("Loading CSV:", CSV_PATH)
    df = pd.read_csv(CSV_PATH)

    print("Columns:", df.columns.tolist())
    print(df.head())

    for col in df.columns:
        df[col] = df[col].fillna("").astype(str)

    df["combined_text"] = df.apply(build_clean_text, axis=1)
    df = df[df["combined_text"].str.strip() != ""]
    all_texts = df["combined_text"].tolist()

    collection = get_or_create_collection()

    ids = [str(i) for i in range(len(all_texts))]
    metadatas = [
        {
            "source": "bhagavad_gita",
            "row_id": str(i),
            "chapter": df.at[i, "Chapter"] if "Chapter" in df.columns else "",
            "verse": df.at[i, "Verse"] if "Verse" in df.columns else "",
        }
        for i in range(len(all_texts))
    ]

    if collection.count() == 0:
        collection.add(
            ids=ids,
            documents=all_texts,
            metadatas=metadatas,
        )
        print("Vector DB created. Count:", collection.count())
    else:
        print("Collection already contains data. Count:", collection.count())

def getgitacontext(question: str, n_results: int = 3) -> str:
    collection = get_collection()
    results = collection.query(
        query_texts=[question],
        n_results=n_results,
    )

    docs = results["documents"][0]
    clean_docs = [doc.strip() for doc in docs if doc.strip()]
    return " ".join(clean_docs[:2])