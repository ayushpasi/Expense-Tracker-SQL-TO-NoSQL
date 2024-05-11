const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization");
  //   console.log("Authorization >>" + token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const userData = await userModel.findByPk(user.userId);
    // console.log("userData" + userData);
    req.user = userData;
    next();
  } catch (err) {
    console.log("Authentication error", err);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { authenticate };
