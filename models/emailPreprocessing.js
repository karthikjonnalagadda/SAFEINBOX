const fs = require('fs');
const joblib = require('joblib');  // Use joblib to load the saved vectorizer
const natural = require('natural');
const stopwords = require('stopword');

const tfidfVectorizer = joblib.load('models/tfidf_vectorizer.pkl');

function preprocessText(text) {
    // Convert to lowercase
    text = text.toLowerCase();
    
    // Tokenize the text
    const tokenizer = new natural.WordTokenizer();
    let words = tokenizer.tokenize(text);
    
    // Remove stopwords
    words = stopwords.removeStopwords(words);

    // Return the processed text
    return words.join(' ');
}

function transformToVector(text) {
    const preprocessedText = preprocessText(text);
    const vectorizedText = tfidfVectorizer.transform([preprocessedText]);
    return vectorizedText;
}

module.exports = {
    preprocessText,
    transformToVector
};
