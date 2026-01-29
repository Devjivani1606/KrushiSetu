import joblib
import numpy as np

model = joblib.load("crop_model.joblib")
le = joblib.load("label_encoder.joblib")

# Example input: N, P, K, ph, temperature, humidity
X = np.array([[90, 42, 43, 6.5, 20.8, 82]])

pred = model.predict(X)[0]
crop = le.inverse_transform([pred])[0]

print("Recommended crop:", crop)
