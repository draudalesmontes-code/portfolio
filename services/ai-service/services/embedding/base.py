from sentence_transformers import SentenceTransformer 

_model = SentenceTransformer("all-MiniLM-L6-v2")

class BaseEmbedder():

    #embedds a single text and returns the embedding
    def embed(self, text: str) -> list[float]:
        return _model.encode(text).tolist()

    #embedds a batch of texts and returns a list of embeddings
    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return _model.encode(texts).tolist()
    


