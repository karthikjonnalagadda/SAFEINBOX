from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import os
from datetime import datetime

# === Paths ===
base_path = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_path,"spam_csv_model.pkl")
vectorizer_path = os.path.join(base_path,"spam_csv_tfidf_vectorizer.pkl")

# === Load Model & Vectorizer ===
try:
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    print("✅ Model and vectorizer loaded successfully!")
except FileNotFoundError as e:
    print(f"❌ Error loading model/vectorizer: {e}")
    raise

# === Text Cleaning ===
def clean_text(text):
    text = text.lower()
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r"http\S+|www\S+|https\S+", '', text)
    text = re.sub(r'\W', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# === Logging ===
def log_prediction(message, label, confidence):
    logs_path = os.path.join(base_path, "logs")
    os.makedirs(logs_path, exist_ok=True)
    log_file = os.path.join(logs_path, "predictions.log")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file, "a") as f:
        f.write(f"{timestamp}\t{label}\t{confidence:.4f}\t{message}\n")

# === Flask Init ===
app = Flask(__name__)
CORS(app)

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "Server is live"}), 200

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        message = data.get("message", "").replace("undefined", "").strip()

        if not message:
            return jsonify({"error": "No message provided"}), 400

        cleaned = clean_text(message)
        print(f"🧹 Cleaned message: {cleaned}")

        if not cleaned or len(cleaned.split()) < 3:
            return jsonify({
                "prediction": 1,
                "label": "spam",
                "confidence": 1.0,
                "note": "Message too short or meaningless after cleaning."
            })

        vector = vectorizer.transform([cleaned])
        proba = model.predict_proba(vector)[0]
        confidence = float(proba[1])
        prediction = 1 if confidence >= 0.4 else 0
        label = "spam" if prediction == 1 else "ham"

        log_prediction(cleaned, label, confidence)

        return jsonify({
            "prediction": prediction,
            "label": label,
            "confidence": round(confidence, 4)
        })

    except Exception as e:
        print(f"❌ Error in /predict:", str(e))
        return jsonify({"error": "Internal server error during prediction"}), 500

@app.route("/test", methods=["GET"])
def test_endpoint():
    test_cases = [
        {"message": "Win a million dollars now!", "expected": "spam"},
        {"message": "Please see the attached report for review.", "expected": "ham"},
        {"message": "undefined", "expected": "spam"},
        {"message": "<html>click here now</html>", "expected": "spam"},
        {"message": " ", "expected": "spam"}
    ]
    results = []
    for test in test_cases:
        cleaned = clean_text(test["message"])
        if not cleaned or len(cleaned.split()) < 3:
            label = "spam"
            confidence = 1.0
        else:
            vector = vectorizer.transform([cleaned])
            proba = model.predict_proba(vector)[0]
            confidence = float(proba[1])
            label = "spam" if confidence >= 0.4 else "ham"
        results.append({
            "message": test["message"],
            "expected": test["expected"],
            "predicted": label,
            "confidence": round(confidence, 4)
        })
    return jsonify(results), 200

# === Run App ===
if __name__ == "__main__":
    app.run(port=5001, debug=True)
