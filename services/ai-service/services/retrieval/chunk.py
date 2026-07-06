class Chunks:

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 256, overlap: int = 64) -> list[str]:
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            chunk = " ".join(words[start:start + chunk_size])
            chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

