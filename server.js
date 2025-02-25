const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const dotenv = require("dotenv");
const Bill = require("./models/Bill");
const BankAccount = require("./models/BankAccount");

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// API to schedule a bill payment
app.post("/api/bills/pay", async (req, res) => {
  const { billType, amount, dueDate, accountNumber } = req.body;
  try {
    const bill = new Bill({ billType, amount, dueDate, accountNumber, status: "Scheduled" });
    await bill.save();
    res.json({ message: "Bill scheduled for auto-debit" });
  } catch (error) {
    res.status(500).json({ error: "Failed to schedule bill payment" });
  }
});

// Auto-Debit Cron Job (Runs every midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("Running auto-debit job...");
  const today = new Date().toISOString().split("T")[0];
  const dueBills = await Bill.find({ dueDate: today, status: "Scheduled" });

  for (const bill of dueBills) {
    const bankAccount = await BankAccount.findOne({ accountNumber: bill.accountNumber });
    if (bankAccount && bankAccount.balance >= bill.amount) {
      bankAccount.balance -= bill.amount;
      await bankAccount.save();
      bill.status = "Paid";
      await bill.save();
      console.log(`Auto-debited ₹${bill.amount} for ${bill.billType}`);
    } else {
      console.log(`Insufficient funds for ${bill.billType}`);
    }
  }
});

// Monthly Bill Re-Scheduling Job (Runs on the 1st of every month)
cron.schedule("0 0 1 * *", async () => {
  console.log("Generating monthly recurring bills...");
  c
