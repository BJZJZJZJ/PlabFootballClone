// Auto incrementing counter model for MongoDB
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 예: "stadium"
  seq: { type: Number, default: 1 },
});

module.exports = mongoose.model("Counter", counterSchema, "Counter");
