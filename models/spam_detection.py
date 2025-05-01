import pandas as pd
import re
import os
import joblib
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, roc_curve
)

# --------------------------------------
# Function to clean email text
# --------------------------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'http\S+|www.\S+', '', text)
    text = re.sub(r'\W', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# --------------------------------------
# Load Enron dataset (with ham/spam folders)
# --------------------------------------
def load_enron_dataset(base_path):
    data = []  # List to store data rows (for better performance)
    for folder in os.listdir(base_path):
        folder_path = os.path.join(base_path, folder)
        if os.path.isdir(folder_path):  # Check if it's a folder (enron1, enron2, ...)
            for subfolder in ["ham", "spam"]:  # Iterate over ham/spam subfolders
                subfolder_path = os.path.join(folder_path, subfolder)
                if os.path.isdir(subfolder_path):
                    label = 0 if subfolder == "ham" else 1  # Ham -> 0, Spam -> 1
                    for file in os.listdir(subfolder_path):
                        if file.endswith(".txt"):  # Assuming text files are used
                            file_path = os.path.join(subfolder_path, file)
                            print(f"📂 Loading: {file_path}")
                            try:
                                with open(file_path, 'r', encoding='latin1') as f:
                                    email_text = f.read()
                                # Add the data to the list
                                data.append({"label": label, "text": email_text})
                            except Exception as e:
                                print(f"❌ Error reading {file_path}: {e}")
    
    # Convert list of dicts to DataFrame
    df = pd.DataFrame(data)
    return df

# --------------------------------------
# Main Workflow
# --------------------------------------
def train_spam_classifier(dataset_path="C:/Users/karth/Downloads/emails"):
    df = load_enron_dataset(dataset_path)

    if df.empty:
        print("❌ No data loaded. Please check the dataset.")
        return

    df.dropna(inplace=True)
    df["text"] = df["text"].apply(clean_text)

    total_ham = (df["label"] == 0).sum()
    total_spam = (df["label"] == 1).sum()
    print(f"\n🧾 Total records: {len(df)} (Ham: {total_ham}, Spam: {total_spam})")

    # Split dataset into training and testing
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["label"], test_size=0.2, random_state=42
    )

    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer(max_df=0.9, min_df=2, stop_words="english", ngram_range=(1, 3))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # Hyperparameter tuning for Naïve Bayes
    param_grid = {'alpha': [0.1, 0.5, 1.0, 2.0, 3.0]}
    grid_search = GridSearchCV(MultinomialNB(), param_grid, cv=5, scoring='accuracy')
    grid_search.fit(X_train_tfidf, y_train)
    model = grid_search.best_estimator_

    print(f"\n✅ Best Alpha: {grid_search.best_params_['alpha']}")

    # Evaluation
    y_pred = model.predict(X_test_tfidf)
    print(f"\n✅ Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\n📊 Classification Report:\n", classification_report(y_test, y_pred, target_names=["Ham", "Spam"]))
    print("\n📊 Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    # ROC Curve
    probs = model.predict_proba(X_test_tfidf)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, probs)
    roc_auc = roc_auc_score(y_test, probs)
    print(f"\n📈 ROC AUC Score: {roc_auc:.4f}")

    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {roc_auc:.2f})', color='navy')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve - Enron Spam Classifier")
    plt.legend(loc="lower right")
    plt.grid()
    plt.tight_layout()
    plt.show()

    # Save Model and Vectorizer
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/enron_spam_model.pkl")
    joblib.dump(vectorizer, "models/enron_tfidf_vectorizer.pkl")
    print("\n💾 Model and vectorizer saved in 'models/' directory.")

# Run the script
if __name__ == "__main__":
    train_spam_classifier("C:/Users/karth/Downloads/emails")
