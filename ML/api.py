import sys
if sys.version_info < (3, 11) or sys.version_info >= (3, 12):
    print("CRITICAL BLOCKER: FAQGenie ML service explicitly requires Python 3.11.x.")
    print(f"Current version is: {sys.version_info.major}.{sys.version_info.minor}")
    print("Please use python3.11 -m venv api_venv and install requirements again.")
    sys.exit(1)

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from predict import predict_intent, generate_embedding

app = FastAPI(
    title="FAQGenie ML API",
    description="Intent classification service for FAQGenie",
    version="1.0.0",
)


class IntentRequest(BaseModel):
    text: str

class EmbedRequest(BaseModel):
    text: str

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "FAQGenie ML API"
    }


@app.post("/predict-intent")
def predict(request: IntentRequest):
    try:
        result = predict_intent(request.text)

        return result

    except (TypeError, ValueError) as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/embed")
def embed(request: EmbedRequest):
    try:
        embedding = generate_embedding(request.text)
        return {"embedding": embedding}
    except (TypeError, ValueError) as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )