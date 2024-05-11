const Rozarpay = require("razorpay");
const orderModel = require("../models/ordersModel");
const userController = require("./userController");

const purchasepremium = async (req, res) => {
  try {
    var rzp = new Rozarpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      req.user
        .createOrder({ orderid: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    // console.log("payentId>>>>" + payment_id);
    const order = await orderModel.findOne({ where: { orderid: order_id } });
    const promise1 = order.update({ paymentid: payment_id });
    const promise2 = req.user.update({ isPremiumUser: true });
    Promise.all([promise1, promise2])
      .then(() => {
        return res.status(202).json({
          sucess: true,
          message: "Transaction Successful",
          token: userController.generateAccessToken(
            req.user.id,
            req.user.name,
            true
          ),
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (err) {
    console.log(err);
    res.status(403).json({ error: err, message: "Sometghing went wrong" });
  }
};

module.exports = { purchasepremium, updateTransactionStatus };
