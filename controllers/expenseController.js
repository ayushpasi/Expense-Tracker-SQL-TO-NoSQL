const ExpenseModel = require("../models/expenseModel");
const UserModel = require("../models/userModel");
const sequelize = require("../util/database");
const Userservices = require("../services/userservices");
const S3services = require("../services/S3services");
const path = require("path");
const { where } = require("sequelize");
const downloadExpenses = async (req, res) => {
  try {
    const expenses = await Userservices.getExpenses(req);
    // console.log(expenses);
    //it should depend upon the userId
    const user = req.user;
    const formattedExpenses = expenses.map((expense) => {
      return `Category: ${expense.expenseCategory}
      Amount: ${expense.expenseAmount}
      Date: ${expense.date}
`;
    });
    const textData = formattedExpenses.join("\n");
    const filename = `expense-data/user${user.id}/${
      user.name
    }${new Date()}.txt`;
    const fileUrl = await S3services.uploadToS3(textData, filename);
    // console.log("file Url>>>>>" + fileUrl);
    res.json({ fileUrl, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ fileUrl: "", success: false, err: err });
  }
};

//save data to database
const addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const date = req.body.date;
    const expenseAmount = req.body.expenseAmount;
    const expenseDescription = req.body.expenseDescription;
    const expenseCategory = req.body.expenseCategory;

    const data = await ExpenseModel.create(
      {
        date: date,
        expenseAmount: expenseAmount,
        expenseDescription: expenseDescription,
        expenseCategory: expenseCategory,
        userId: req.user.id,
      },
      { transaction: t }
    );

    const newTotalExpense =
      parseInt(req.user.totalExpense) + parseInt(expenseAmount);

    await UserModel.update(
      {
        totalExpense: newTotalExpense,
      },
      {
        where: { id: req.user.id },
        transaction: t, // Pass the transaction object here
      }
    );

    await t.commit();
    res.status(201).json({ expense: data });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      error: "Failed to create a new expense",
      message: error.message,
    });
  }
};
//fetch all expenses
const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await ExpenseModel.findAll({
      where: { userId: req.user.id },
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err: err,
    });
  }
};

//expenses pagination
const getAllExpensesforPagination = async (req, res) => {
  try {
    const pageNo = req.params.page;
    const limit = parseInt(req.query.limit || 10);
    const offset = (pageNo - 1) * limit;

    const totalExpenses = await ExpenseModel.count({
      where: {
        userId: req.user.id,
      },
    });
    const totalPages = Math.ceil(totalExpenses / limit);

    const expenses = await ExpenseModel.findAll({
      where: {
        userId: req.user.id,
      },
      offset: offset,
      limit: limit,
    });

    res.status(200).json({ expenses: expenses, totalPages: totalPages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//delete user
const deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const expenseId = req.params.id; // Use expenseId instead of userId
    // console.log(expenseId);
    if (!expenseId) {
      return res.status(400).json({
        error: "Expense ID missing",
      });
    }

    // Check if the expense exists for the given ID
    const expense = await ExpenseModel.findOne({
      where: {
        id: expenseId,
      },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    // Delete the expense
    const deleteResult = await ExpenseModel.destroy({
      where: {
        id: expenseId,
      },
      transaction: t,
    });

    // Update total expense of the user
    const newTotalExpense = req.user.totalExpense - expense.expenseAmount;
    await req.user.update(
      { totalExpense: newTotalExpense },
      { transaction: t }
    );

    await t.commit();

    if (deleteResult === 1) {
      return res.status(200).json({
        success: "Expense deleted successfully",
      });
    } else {
      return res.status(404).json({
        error: "Expense not found",
      });
    }
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({
      error: "Error in deleting expense",
    });
  }
};
const getHomePage = async (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "homePage.html")
    );
  } catch {
    (err) => console.log(err);
  }
};

const editExpense = async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = req.body.expenseCategory;
    const description = req.body.expenseDescription;
    const amount = req.body.expenseAmount;
    // console.log("expense id" + id);
    // console.log(req.user.id);
    const expense = await ExpenseModel.findByPk(id);
    const newTotalExpense =
      parseInt(req.user.totalExpense) -
      parseInt(expense.expenseAmount) +
      parseInt(amount);

    await UserModel.update(
      { totalExpense: newTotalExpense },
      { where: { id: req.user.id } }
    );

    await ExpenseModel.update(
      {
        expenseCategory: category,
        expenseDescription: description,
        expenseAmount: amount,
      },
      { where: { id: id, userId: req.user.id } }
    );
    res.status(200).json({ message: "updated succesfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing expense");
  }
};

module.exports = {
  addExpense,
  getAllExpenses,
  deleteExpense,
  downloadExpenses,
  getAllExpensesforPagination,
  getHomePage,
  editExpense,
};
