const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  paymentid: {
    type: String,
  },
  orderid: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
