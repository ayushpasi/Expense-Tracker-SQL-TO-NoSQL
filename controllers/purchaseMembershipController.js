const Razorpay = require("razorpay");
const Order = require("../models/ordersModel");
const userController = require("./userController");

const purchasepremium = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 2500;

    rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Razorpay order creation failed1", error: err });
      }

      const newOrder = new Order({
        paymentid: null,
        orderid: order.id,
        status: "PENDING",
        userId: req.user._id, // Assuming req.user is populated with the logged-in user
      });

      try {
        await newOrder.save();
        return res.status(201).json({ order, key_id: rzp.key_id });
      } catch (saveError) {
        return res
          .status(500)
          .json({ message: "Order creation failed", error: saveError });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;

    const order = await Order.findOne({ orderid: order_id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentid = payment_id;
    await order.save();

    req.user.isPremiumUser = true;
    await req.user.save();

    const token = userController.generateAccessToken(
      req.user.id,
      req.user.name,
      true
    );

    return res.status(202).json({
      success: true,
      message: "Transaction Successful",
      token: token,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: err.message, message: "Something went wrong" });
  }
};

module.exports = { purchasepremium, updateTransactionStatus };
