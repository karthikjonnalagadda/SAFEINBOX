const axios = require('axios');

// Function to predict spam using the Flask API
async function predictSpam(text) {
    try {
        // Send the text to the Flask API for prediction
        const response = await axios.post('http://localhost:5000/predict', { message: text });

        // Get the prediction result from the API response
        const prediction = response.data.prediction;
        
        // Return the result - 'spam' or 'ham'
        return prediction;
    } catch (error) {
        // Handle errors in API communication
        console.error("Error calling Python API:", error);
        return null;
    }
}

module.exports = {
    predictSpam
};
