const joblib = require('joblib');
const { transformToVector } = require('./emailPreprocessing');

const model = joblib.load('models/spam_model.pkl');  // Load the pre-trained spam detection model

// Predict if the email is spam or not
function predictSpam(text) {
    const vectorizedText = transformToVector(text);
    const prediction = model.predict(vectorizedText);
    return prediction[0] === 1 ? 'spam' : 'ham'; // Return 'spam' or 'ham' based on prediction
}

module.exports = {
    predictSpam
};
