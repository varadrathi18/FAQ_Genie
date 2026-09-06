from pathlib import Path

import joblib
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

# Load configuration
config = joblib.load(MODEL_DIR / "model_config.joblib")

# Load classifier
classifier = joblib.load(
    MODEL_DIR / "intent_classifier.joblib"
)

# Load embedding model
embedding_model = SentenceTransformer(
    config["embedding_model"]
)

OOS_THRESHOLD = config["oos_threshold"]


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

    # Generate MPNet embedding
    embedding = embedding_model.encode(
        [text],
        convert_to_numpy=True
    )

    # Get probabilities
    probabilities = classifier.predict_proba(embedding)[0]

    # Most likely intent
    best_index = probabilities.argmax()
    best_intent = classifier.classes_[best_index]
    confidence = float(probabilities[best_index])

    # OOS rejection
    if confidence < OOS_THRESHOLD:
        return {
            "intent": "out_of_scope",
            "confidence": confidence,
            "is_out_of_scope": True
        }

    return {
        "intent": best_intent,
        "confidence": confidence,
        "is_out_of_scope": False
    }

def generate_embedding(text: str) -> list[float]:
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    text = text.strip()

    if not text:
        raise ValueError("text cannot be empty")

    embedding = embedding_model.encode(
        [text],
        convert_to_numpy=True
    )[0]

    return embedding.tolist()

