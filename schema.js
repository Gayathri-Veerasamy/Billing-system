const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  image: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('Item', itemSchema);
