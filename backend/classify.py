import sys
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

# Load trained model
with open("spam_classifier.pkl", "rb") as model_file:
    spam_classifier = pickle.load(model_file)

# Load the TF-IDF Vectorizer (must match training settings)
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))

def classify_email(email_text):
    # Convert input to DataFrame
    input_text = pd.Series([email_text])

    # Transform text into TF-IDF features
    input_features = vectorizer.fit_transform(input_text)

    # Predict
    prediction = spam_classifier.predict(input_features)[0]
    
    return int(prediction)  # 1 = Spam, 0 = Ham

if __name__ == "__main__":
    email_text = sys.argv[1]
    print(classify_email(email_text))
