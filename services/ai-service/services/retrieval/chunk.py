from transformers import AutoTokenizer

_tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")



class Chunks:
    
    #split text into chunks of a specified size
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 256, overlap: int = 64) -> list[str]:
        chunks = []
        token_id = _tokenizer.encode(text, add_special_tokens=False)
        start = 0
        while start < len(token_id):
            end = start + chunk_size
            chunks_ids =  token_id[start:end]
            chunk = _tokenizer.decode(chunks_ids)
            chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

