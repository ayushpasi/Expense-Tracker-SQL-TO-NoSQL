const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");

const getLoginPage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
  } catch (error) {
    console.log(error);
  }
};

const postUserSignUp = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Some data is missing" });
  }

  try {
    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({
        error: "This email is already taken. Please choose another one.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("succesfull");
    res.status(200).json({ message: "Registered successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const generateAccessToken = (id, name, isPremiumUser) => {
  return jwt.sign(
    { userId: id, name: name, isPremiumUser },
    process.env.TOKEN_SECRET
  );
};
const postUserLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      bcrypt.compare(password, existingUser.password, (err, result) => {
        if (err) {
          res.status(500).json({ error: "something went wrong" });
        }
        if (result === true) {
          res.status(200).json({
            message: "user logged in successfully",
            token: generateAccessToken(
              existingUser.id,
              existingUser.name,
              existingUser.isPremiumUser
            ),
          });
        } else {
          res.status(401).json({ error: "User not authorized" });
        }
      });
    } else {
      res.status(404).json({ error: "User Not Found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  postUserSignUp,
  getLoginPage,
  postUserLogin,
  generateAccessToken,
};
