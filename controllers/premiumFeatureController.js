const UserModel = require("../models/userModel");
const ExpenseModel = require("../models/expenseModel");
const sequelize = require("sequelize");
const path = require("path");
const { Op } = require("sequelize");

const getUserLeaderBoard = async (req, res) => {
  try {
    const userLeaderboardDetails = await UserModel.find(
      {},
      "name totalExpense"
    ).sort({ totalExpense: -1 });

    res.status(200).json({ userLeaderboardDetails });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching the leaderboard details.",
    });
  }
};

const getLeaderboardPage = (req, res, next) => {
  try {
    res.sendFile(
      path.join(__dirname, "../", "public", "views", "leaderboard.html")
    );
  } catch {
    (err) => console.log(err);
  }
};
const getReportsPage = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "public", "views", "reports.html"));
};

const dailyReports = async (req, res, next) => {
  try {
    const { date } = req.body;
    const expenses = await ExpenseModel.find({
      date: date,
      userId: req.user.id,
    });
    return res.send(expenses);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the daily reports." });
  }
};

const monthlyReports = async (req, res, next) => {
  try {
    const { month } = req.body;

    const expenses = await ExpenseModel.find({
      date: { $regex: `-${month}-` },
      userId: req.user.id,
    });

    return res.json(expenses);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching the monthly reports." });
  }
};

module.exports = {
  getUserLeaderBoard,
  getLeaderboardPage,
  getReportsPage,
  dailyReports,
  monthlyReports,
};
