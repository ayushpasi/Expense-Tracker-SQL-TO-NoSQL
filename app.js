const express = require("express");
// const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const bodyParser = require("body-parser");
// const morgan = require("morgan");
const path = require("path");

const fs = require("fs");

const userRouter = require("./routes/userRouter");
const mongoose = require("mongoose");
// const expenseRouter = require("./routes/expenseRouter");

// const Expense = require("./models/expenseModel");
// const User = require("./models/userModel");
// const Order = require("./models/ordersModel");
// const ResetPassword = require("./models/resetPasswordModel");

// const userauthentication = require("./middleware/authentication");
// const purchaseMembershipRouter = require("./routes/purchaseMembershipRouter");
// const premiumFeatureRouter = require("./routes/premiumFeatureRouter");

// const resetPasswordRouter = require("./routes/resetPasswordRouter");

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// );

const cors = require("cors");
const app = express();
// app.use(helmet());
// app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", userRouter);
app.use("/user", userRouter);
// app.use("/homePage", expenseRouter);
// app.use("/expense", userauthentication.authenticate, expenseRouter);
// app.use("/purchase", purchaseMembershipRouter);
// app.use("/premium", premiumFeatureRouter);

// app.use("/password", resetPasswordRouter);

// User.hasMany(Expense);
// Expense.belongsTo(User);

// User.hasMany(Order);
// Order.belongsTo(User);

// ResetPassword.belongsTo(User);
// User.hasMany(ResetPassword);

async function initiate() {
  try {
    const result = await mongoose.connect(process.env.MONGODB);
    console.log(`app run at http://localhost:${process.env.PORT}`);
    app.listen(process.env.PORT);
  } catch (err) {
    console.log(err);
  }
}
initiate();
