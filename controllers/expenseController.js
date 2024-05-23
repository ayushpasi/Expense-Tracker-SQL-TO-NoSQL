const ExpenseModel = require("../models/expenseModel");
const UserModel = require("../models/userModel");
const sequelize = require("../util/database");
const Userservices = require("../services/userservices");
const S3services = require("../services/S3services");
const mongoose = require("mongoose");
const path = require("path");
const downloadExpenses = async (req, res) => {
  try {
    const expenses = await Userservices.getExpenses(req);

    // it should depend upon the userId
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { date, expenseAmount, expenseDescription, expenseCategory } =
      req.body;
    // console.log(`user id ${req.user.id}`);
    const expense = new ExpenseModel({
      date,
      expenseAmount,
      expenseDescription,
      expenseCategory,
      userId: req.user.id,
    });

    await expense.save({ session });

    const user = await UserModel.findById(req.user.id).session(session);
    user.totalExpense += parseInt(expenseAmount);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ expense });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({
      error: "Failed to create a new expense",
      message: error.message,
    });
  }
};

const getAllExpensesforPagination = async (req, res) => {
  try {
    const pageNo = parseInt(req.params.page);
    const limit = parseInt(req.query.limit || 10);
    const skip = (pageNo - 1) * limit;

    const totalExpenses = await ExpenseModel.countDocuments({
      userId: req.user.id,
    });
    const totalPages = Math.ceil(totalExpenses / limit);

    const expenses = await ExpenseModel.find({ userId: req.user.id })
      .skip(skip)
      .limit(limit);
    // console.log(`expenses >>>>${expenses}`);
    res.status(200).json({ expenses, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//delete expense
const deleteExpense = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const expenseId = req.params.id;
    // console.log(`DELETE ID ${expenseId}`);
    if (!expenseId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Expense ID missing",
      });
    }

    const expense = await ExpenseModel.findById(expenseId).session(session);
    // console.log(`expense ${expense}`);
    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        error: "Expense not found",
      });
    }

    const deleteResult = await ExpenseModel.deleteOne({
      _id: expenseId,
    }).session(session);

    const user = req.user;
    user.totalExpense -= expense.expenseAmount;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    if (deleteResult.deletedCount === 1) {
      return res.status(200).json({
        success: "Expense deleted successfully",
      });
    } else {
      return res.status(404).json({
        error: "Expense not found",
      });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
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
    const _id = req.params.id;
    // console.log("_id:>>>>>>>", _id);
    const category = req.body.expenseCategory;
    const description = req.body.expenseDescription;
    const amount = req.body.expenseAmount;
    const userId = req.user._id;
    const expense = await ExpenseModel.findById(_id);
    // console.log(expense);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const newTotalExpense =
      parseInt(req.user.totalExpense) -
      parseInt(expense.expenseAmount) +
      parseInt(amount);

    // Update totalExpense in the user document
    await UserModel.findByIdAndUpdate(userId, {
      totalExpense: newTotalExpense,
    });

    // Update expense document
    await ExpenseModel.findByIdAndUpdate(_id, {
      // Changed id to _id
      expenseCategory: category,
      expenseDescription: description,
      expenseAmount: amount,
    });

    res.status(200).json({ message: "updated succesfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing expense");
  }
};

module.exports = {
  addExpense,
  deleteExpense,
  downloadExpenses,
  getAllExpensesforPagination,
  getHomePage,
  editExpense,
};
