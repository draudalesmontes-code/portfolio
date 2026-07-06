from fastembed import TextEmbedding

_model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")

class BaseEmbedder():

    def embed(self, text: str) -> list[float]:
        return list(_model.embed([text]))[0].tolist()

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [e.tolist() for e in _model.embed(texts)]

