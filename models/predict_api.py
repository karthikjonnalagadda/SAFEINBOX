# models/predict_api.py
from flask import Flask, request, jsonify
import joblib
import re

# Load the model and vectorizer
model = joblib.load("models/spam_classifier_model.pkl")
vectorizer = joblib.load("models/tfidf_vectorizer.pkl")

# Text cleaner
def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", '', text)
    text = re.sub(r'\W', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print(f"Received data: {data}")  # Log incoming request data
    message = data.get("message", "")
    cleaned = clean_text(message)
    vector = vectorizer.transform([cleaned])
    prediction = model.predict(vector)[0]
    label = "spam" if prediction == 1 else "ham"
    return jsonify({"prediction": label})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
