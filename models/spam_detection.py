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
# Clean email text
# --------------------------------------
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'http\S+|www.\S+', '', text)
    text = re.sub(r'\W', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# --------------------------------------
# Load CSV dataset (spam.csv from Kaggle)
# --------------------------------------
def load_csv_dataset(csv_path):
    df = pd.read_csv(csv_path, encoding='latin1')
    df = df.rename(columns={"v1": "label", "v2": "text"})
    df = df[["label", "text"]]
    df["label"] = df["label"].map({"ham": 0, "spam": 1})
    return df

# --------------------------------------
# Train Spam Classifier with threshold
# --------------------------------------
def train_spam_classifier(csv_path="C:/Users/karth/Downloads/archive/spam.csv", threshold=0.4):
    df = load_csv_dataset(csv_path)

    if df.empty:
        print("❌ No data loaded. Please check the CSV path.")
        return

    df.dropna(inplace=True)
    df["text"] = df["text"].apply(clean_text)

    total_ham = (df["label"] == 0).sum()
    total_spam = (df["label"] == 1).sum()
    print(f"\n🧾 Total records: {len(df)} (Ham: {total_ham}, Spam: {total_spam})")

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["label"], test_size=0.2, random_state=42
    )

    vectorizer = TfidfVectorizer(max_df=0.9, min_df=2, stop_words="english", ngram_range=(1, 3))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    param_grid = {'alpha': [0.1, 0.5, 1.0, 2.0, 3.0]}
    grid_search = GridSearchCV(MultinomialNB(), param_grid, cv=5, scoring='accuracy')
    grid_search.fit(X_train_tfidf, y_train)
    model = grid_search.best_estimator_

    print(f"\n✅ Best Alpha: {grid_search.best_params_['alpha']}")

    y_probs = model.predict_proba(X_test_tfidf)[:, 1]
    y_pred = (y_probs >= threshold).astype(int)

    print(f"\n✅ Accuracy (threshold={threshold}): {accuracy_score(y_test, y_pred):.4f}")
    print("\n📊 Classification Report:\n", classification_report(y_test, y_pred, target_names=["Ham", "Spam"]))
    print("\n📊 Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    fpr, tpr, _ = roc_curve(y_test, y_probs)
    roc_auc = roc_auc_score(y_test, y_probs)
    print(f"\n📈 ROC AUC Score: {roc_auc:.4f}")

    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, label=f'ROC Curve (AUC = {roc_auc:.2f})', color='navy')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"ROC Curve - Threshold: {threshold}")
    plt.legend(loc="lower right")
    plt.grid()
    plt.tight_layout()
    plt.show()

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/spam_csv_model.pkl")
    joblib.dump(vectorizer, "models/spam_csv_tfidf_vectorizer.pkl")
    print("\n💾 Model and vectorizer saved in 'models/' directory.")

# --------------------------------------
# Entry point
# --------------------------------------
if __name__ == "__main__":
    train_spam_classifier("C:/Users/karth/Downloads/archive/spam.csv", threshold=0.4)
