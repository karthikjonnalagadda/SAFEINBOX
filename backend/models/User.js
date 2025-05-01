const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Used for both normal and Google users
});

module.exports = mongoose.model("User", userSchema);
