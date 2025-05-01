import sys
import joblib
import re

# Load the trained model and vectorizer
model = joblib.load("models/enron_spam_model.pkl")
vectorizer = joblib.load("models/enron_tfidf_vectorizer.pkl")

def classify_email(email_text):
    # Clean the input email text (same cleaning function as used during training)
    email_text = str(email_text).lower()
    email_text = re.sub(r'<.*?>', '', email_text)
    email_text = re.sub(r'http\S+|www.\S+', '', email_text)
    email_text = re.sub(r'\W', ' ', email_text)
    email_text = re.sub(r'\s+', ' ', email_text).strip()

    # Transform the cleaned email text using the pre-trained vectorizer
    email_features = vectorizer.transform([email_text])

    # Predict using the trained model
    prediction = model.predict(email_features)[0]

    # Return 1 for spam, 0 for ham
    return int(prediction)

if __name__ == "__main__":
    # Instead of using sys.argv, use input() to read email text interactively
    email_text = input("Enter the email text to classify: ")
    
    # Classify and print result (1 for spam, 0 for ham)
    print("Spam or Ham:", "Spam" if classify_email(email_text) == 1 else "Ham")
