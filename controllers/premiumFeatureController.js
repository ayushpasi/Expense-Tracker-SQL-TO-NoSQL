const UserModel = require("../models/userModel");
const ExpenseModel = require("../models/expenseModel");
const sequelize = require("sequelize");
const path = require("path");
const { Op } = require("sequelize");

const getUserLeaderBoard = async (req, res) => {
  try {
    const userLeaderboardDetails = await UserModel.findAll({
      attributes: ["name", "totalExpense"],
      order: [[sequelize.literal("totalExpense"), "DESC"]],
    });

    res.status(200).json({ userLeaderboardDetails });
    //Brute force approach
    // const users = await userModel.findAll();
    // const expenses = await expenseModel.findAll();
    // const userAgreegatedExpens = {};
    // expenses.forEach((expense) => {
    //   if (userAgreegatedExpens[expense.userId]) {
    //     userAgreegatedExpens[expense.userId] += expense.expenseAmount;
    //   } else {
    //     userAgreegatedExpens[expense.userId] = expense.expenseAmount;
    //   }
    // });
    // const userLeaderboardDetails = [];
    // users.forEach((user) => {
    //   userLeaderboardDetails.push({
    //     name: user.name,
    //     total_cost: userAgreegatedExpens[user.id]||0,
    //   });
    // });

    // userLeaderboardDetails.sort((a, b) => b.total_cost - a.total_cost);
    // res.status(200).json({ userLeaderboardDetails });
    // const userLeaderboardDetails = await userModel.findAll({
    //   attributes: [
    //     "name",
    //     [
    //       sequelize.fn("sum", sequelize.col("expenses.expenseAmount")),
    //       "total_cost",
    //     ],
    //   ],
    //   include: [
    //     {
    //       model: expenseModel,
    //       attributes: [],
    //     },
    //   ],
    //   group: ["users.id"],
    //   order: [[sequelize.literal("total_cost"), "DESC"]],
    // });
    // console.log(userLeaderboardDetails);
    // res.status(200).json({ userLeaderboardDetails });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
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
    const date = req.body.date;
    const expenses = await ExpenseModel.findAll({
      where: { date: date, userId: req.user.id },
    });
    return res.send(expenses);
  } catch (error) {
    console.log(error);
  }
};

const monthlyReports = async (req, res, next) => {
  try {
    const month = req.body.month;

    const expenses = await ExpenseModel.findAll({
      where: {
        date: {
          [Op.like]: `%-${month}-%`,
        },
        userId: req.user.id,
      },
      raw: true,
    });

    return res.json(expenses);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getUserLeaderBoard,
  getLeaderboardPage,
  getReportsPage,
  dailyReports,
  monthlyReports,
};
