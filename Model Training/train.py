import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# 1) Load the dataset
df = pd.read_csv("Crop_recommendation.csv")

# 2) Select features (INPUTS) - rainfall is dropped
X = df[["N", "P", "K", "ph", "temperature", "humidity"]]

# 3) Select label (OUTPUT)
y = df["label"]

# 4) Convert crop names into numbers (machine understands numbers)
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# 5) Split data into training (80%) and testing (20%)
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# 6) Create and train the model
model = RandomForestClassifier(n_estimators=400, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# 7) Test the model (check accuracy)
pred = model.predict(X_test)
acc = accuracy_score(y_test, pred)
print("Accuracy:", acc)

# 8) Save the trained model and label encoder
joblib.dump(model, "crop_model.joblib")
joblib.dump(le, "label_encoder.joblib")

print("Saved: crop_model.joblib and label_encoder.joblib")
