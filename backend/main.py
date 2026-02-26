from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import os
from typing import List, Dict, Any

app = FastAPI(title="KrushiSetu Crop Recommendation API")

# CORS (for React Native device calls)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + label encoder from backend folder
BASE_DIR = os.path.dirname(__file__)  # backend/
MODEL_PATH = os.path.join(BASE_DIR, "crop_model.joblib")
LE_PATH = os.path.join(BASE_DIR, "label_encoder.joblib")

model = None
le = None


class CropInput(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    temperature: float
    humidity: float


@app.on_event("startup")
def load_assets():
    global model, le

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")

    if not os.path.exists(LE_PATH):
        raise FileNotFoundError(f"Label encoder not found at: {LE_PATH}")

    model = joblib.load(MODEL_PATH)
    le = joblib.load(LE_PATH)

    print(f"✅ Model loaded: {MODEL_PATH}")
    print(f"✅ LabelEncoder loaded: {LE_PATH}")


@app.get("/health")
def health():
    return {
        "ok": True,
        "model_loaded": model is not None,
        "label_encoder_loaded": le is not None,
    }


@app.post("/predict")
def predict(inp: CropInput) -> Dict[str, Any]:
    """
    Input order MUST match training:
    X = ["N","P","K","ph","temperature","humidity"]
    """
    if model is None or le is None:
        return {"error": "Model or LabelEncoder not loaded"}

    X = np.array([[inp.N, inp.P, inp.K, inp.ph, inp.temperature, inp.humidity]])

    # Top-3 predictions using predict_proba
    if not hasattr(model, "predict_proba"):
        # fallback: only predict
        pred_id = int(model.predict(X)[0])
        crop = le.inverse_transform([pred_id])[0]
        return {
            "recommended_crop": str(crop),
            "confidence": None,
            "top3": [{"crop": str(crop), "confidence": None}],
        }

    proba = model.predict_proba(X)[0]
    top3_idx = np.argsort(proba)[::-1][:3]

    top3: List[Dict[str, Any]] = []
    for i in top3_idx:
        crop_name = le.inverse_transform([int(i)])[0]
        top3.append({"crop": str(crop_name), "confidence": float(proba[i])})

    return {
        "recommended_crop": top3[0]["crop"],
        "confidence": top3[0]["confidence"],
        "top3": top3,
    }
