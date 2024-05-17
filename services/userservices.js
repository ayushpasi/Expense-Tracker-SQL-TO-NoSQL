const ExpenseModel = require("../models/expenseModel");

const getExpenses = async (req, where) => {
  try {
    const userId = req.user._id;
    const expenses = await ExpenseModel.find({ userId, ...where });
    return expenses;
  } catch (error) {
    console.error(error);
    throw new Error("Unable to fetch expenses");
  }
};

module.exports = {
  getExpenses,
};
