const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  expenseAmount: {
    type: Number,
    required: true,
  },
  expenseDescription: {
    type: String,
    required: true,
  },
  expenseCategory: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const ExpenseModel = mongoose.model("Expense", expenseSchema);

module.exports = ExpenseModel;
