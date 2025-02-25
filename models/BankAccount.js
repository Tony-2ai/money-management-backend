const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema({
  accountNumber: String,
  balance: Number,
});

module.exports = mongoose.model("BankAccount", BankAccountSchema);
