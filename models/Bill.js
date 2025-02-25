const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  billType: String,
  amount: Number,
  dueDate: String,
  accountNumber: String,
  status: { type: String, default: "Scheduled" },
});

module.exports = mongoose.model("Bill", BillSchema);
