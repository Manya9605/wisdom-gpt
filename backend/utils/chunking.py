def split_text(text, max_chunk_len=200):
    words = text.split()
    chunks = []
    current = []
    current_len = 0

    for w in words:
        if current_len + len(w) <= max_chunk_len:
            current.append(w)
            current_len += len(w) + 1
        else:
            chunks.append(" ".join(current))
            current = [w]
            current_len = len(w)

    if current:
        chunks.append(" ".join(current))

    return chunks