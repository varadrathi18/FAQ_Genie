import gc
from pathlib import Path

import joblib
import torch

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

_config = None
_classifier = None
_embedding_model = None


def _get_models():
    global _config, _classifier, _embedding_model
    if _embedding_model is None:
        torch.set_num_threads(1)
        torch.set_grad_enabled(False)

        _config = joblib.load(MODEL_DIR / "model_config.joblib")
        _classifier = joblib.load(MODEL_DIR / "intent_classifier.joblib")

        from sentence_transformers import SentenceTransformer

        _embedding_model = SentenceTransformer(
            _config["embedding_model"],
            device="cpu",
            model_kwargs={"low_cpu_mem_usage": True},
        )
        gc.collect()

    return _config, _classifier, _embedding_model


def predict_intent(text: str) -> dict:
    """
    Predict the intent of a user query.

    Returns:
        {
            "intent": str,
            "confidence": float,
            "is_out_of_scope": bool
        }
    """

    if not isinstance(text, str):
        raise TypeError("text must be a string")

    text = text.strip()

    if not text:
        raise ValueError("text cannot be empty")

    config, classifier, embedding_model = _get_models()
    oos_threshold = config["oos_threshold"]

    # Generate MPNet embedding
    with torch.no_grad():
        embedding = embedding_model.encode([text], convert_to_numpy=True)

    # Get probabilities
    probabilities = classifier.predict_proba(embedding)[0]

    # Most likely intent
    best_index = probabilities.argmax()
    best_intent = classifier.classes_[best_index]
    confidence = float(probabilities[best_index])

    # OOS rejection
    if confidence < oos_threshold:
        return {
            "intent": "out_of_scope",
            "confidence": confidence,
            "is_out_of_scope": True,
        }

    return {
        "intent": best_intent,
        "confidence": confidence,
        "is_out_of_scope": False,
    }


def generate_embedding(text: str) -> list[float]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    text = text.strip()

    if not text:
        raise ValueError("text cannot be empty")

    _, _, embedding_model = _get_models()

    with torch.no_grad():
        embedding = embedding_model.encode([text], convert_to_numpy=True)[0]

    return embedding.tolist()


