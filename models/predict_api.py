from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import os
from datetime import datetime

# === Setup === #
base_path = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_path, "enron_spam_model.pkl")
vectorizer_path = os.path.join(base_path, "enron_tfidf_vectorizer.pkl")

try:
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    print("✅ Model and vectorizer loaded successfully!")
except FileNotFoundError as e:
    print(f"❌ Error loading files: {e}")
    raise

# === Utils === #
def clean_text(text):
    text = text.lower()
    text = re.sub(r'<.*?>', '', text)  # Remove HTML tags
    text = re.sub(r'\S+@\S+', '', text)  # Remove email addresses
    text = re.sub(r"http\S+|www\S+|https\S+", '', text)  # Remove URLs
    text = re.sub(r'\W', ' ', text)  # Remove non-word characters
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra whitespace
    return text

def log_prediction(message, label, confidence):
    logs_path = os.path.join(base_path, "logs")
    os.makedirs(logs_path, exist_ok=True)
    log_file = os.path.join(logs_path, "predictions.log")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(log_file, "a") as f:
        f.write(f"{timestamp}\t{label}\t{confidence:.4f}\t{message}\n")

# === App Init === #
app = Flask(__name__)
CORS(app)

# === Routes === #

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "Server is live!"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print(f"📩 Received data: {data}")

    message = data.get("message", "")
    if not message:
        return jsonify({"error": "No message provided"}), 400

    # 🚫 Remove 'undefined' string if present
    message = message.replace("undefined", "").strip()

    try:
        cleaned = clean_text(message)
        print(f"🧹 Cleaned message: {cleaned}")

        vector = vectorizer.transform([cleaned])
        prediction = model.predict(vector)[0]
        label = "spam" if prediction == 1 else "ham"

        proba = model.predict_proba(vector)[0]
        confidence = float(proba[1]) if label == "spam" else float(proba[0])

        # Log the prediction
        log_prediction(cleaned, label, confidence)

        return jsonify({
            "prediction": label,
            "confidence": round(confidence, 4)
        })

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return jsonify({"error": "Error processing the request"}), 500

# === Main === #
if __name__ == '__main__':
    app.run(port=5000, debug=True)
