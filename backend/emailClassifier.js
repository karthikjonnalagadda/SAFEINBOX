function classifyEmail(emailContent) {
    // Add your ML model logic here (e.g., spam classification)
    return emailContent.includes("spam") ? true : false;
}

module.exports = { classifyEmail };
