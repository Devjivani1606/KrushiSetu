KrushiSetu — FastAPI backend for Crop Recommendation

Overview
- Loads a trained crop recommendation model saved at `Model Training/crop_model.joblib`.
- Exposes POST `/predict` accepting soil & weather parameters and returning the recommended crop.

Quick start (macOS / Linux)

1. Create and activate a virtual environment (recommended):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the API (listen on all interfaces so a physical device can reach it):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. Replace `0.0.0.0` with your machine IP in the mobile app fetch URL.

API
- POST `/predict` — JSON body with fields: `N`, `P`, `K`, `temperature`, `humidity`, `pH`.
- Response: `{ "recommended_crop": "CropName", "details": { ... } }`

Notes
- The code assumes the model file is at `Model Training/crop_model.joblib` at the repo root.
- If your model uses encoded labels, please load the associated label encoder and call `inverse_transform` to get crop name strings.
- For production, set secure CORS origins instead of `allow_origins=["*"]`.
