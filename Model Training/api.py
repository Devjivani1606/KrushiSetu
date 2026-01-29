from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("crop_model.joblib")
le = joblib.load("label_encoder.joblib")

class CropInput(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    temperature: float
    humidity: float

@app.post("/predict")
def predict(inp: CropInput):
    X = np.array([[inp.N, inp.P, inp.K, inp.ph, inp.temperature, inp.humidity]])
    proba = model.predict_proba(X)[0]

    top3_idx = np.argsort(proba)[::-1][:3]
    top3 = [{"crop": le.inverse_transform([i])[0], "confidence": float(proba[i])} for i in top3_idx]

    return {
        "recommended_crop": top3[0]["crop"],
        "confidence": top3[0]["confidence"],
        "top3": top3
    }
