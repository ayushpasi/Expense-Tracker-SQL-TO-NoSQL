const path = require("path");
const UserModel = require("../models/userModel");
const Sib = require("sib-api-v3-sdk");
const uuid = require("uuid");
const ResetPassword = require("../models/resetPasswordModel");
const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const forgotPasswordPage = (req, res) => {
  res.sendFile(
    path.join(__dirname, "../", "public", "views", "forgotPassword.html")
  );
};

const sendMail = async (req, res) => {
  try {
    const requestId = uuid.v4();
    const { email } = req.body;
    const recepientEmail = await UserModel.findOne({ where: { email: email } });
    // console.log(recepientEmail);
    if (!recepientEmail) {
      return res
        .status(404)
        .json({ message: "Please provide the registered email!" });
    }
    const resetRequest = await ResetPassword.create({
      id: requestId,
      isActive: true,
      userId: recepientEmail.dataValues.id,
    });
    const client = Sib.ApiClient.instance;

    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.API_KEY;

    const sender = {
      email: "ayushpasi8839@gmail.com",
      name: "SmartSpend",
    };

    const receivers = [
      {
        email: email,
      },
    ];

    const transactionalEmailApi = new Sib.TransactionalEmailsApi();

    const emailResponse = await transactionalEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Reset Password for Your Account",
      htmlContent: `
        <p>Hello,</p>
        <p>Please follow the link to reset your password.</p>
        <p><a href="${process.env.WEBSITE}/password/resetPasswordPage/{{params.requestId}}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
      params: {
        requestId: requestId,
      },
    });
    return res.status(200).json({
      message:
        "Link for reset the password is successfully send on your Mail Id!",
    });
  } catch (error) {
    console.log(error);
    return res.status(409).json({ message: "failed changing password" });
  }
};

const resetPasswordPage = async (req, res) => {
  res
    .status(200)
    .sendFile(
      path.join(__dirname, "../", "public", "views", "resetPassword.html")
    );
};

const updatePassword = async (req, res) => {
  try {
    const requestId = req.headers.referer.split("/");
    // console.log(">>>>>>", requestId);
    const password = req.body.password;
    const checkResetRequest = await ResetPassword.findAll({
      where: { id: requestId[requestId.length - 1], isActive: true },
    });

    if (checkResetRequest[0]) {
      const userId = checkResetRequest[0].dataValues.userId;

      const result = await ResetPassword.update(
        { isActive: false },
        { where: { id: requestId } }
      );
      // console.log(result);
      if (result == 1) {
        const newPassword = await hashPassword(password);
        await UserModel.update(
          { password: newPassword },
          { where: { id: userId } }
        );
        res
          .status(201)
          .json({ message: "Successfuly update the new password" });
      }
    }
  } catch (error) {
    return res.status(403).json({ error, success: false });
  }
};
module.exports = {
  forgotPasswordPage,
  sendMail,
  resetPasswordPage,
  updatePassword,
};
