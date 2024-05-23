const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const userauthentication = require("../middleware/authentication");
const expenseController = require("../controllers/expenseController");

router.get("/", userController.getLoginPage);
router.post("/sign-up", userController.postUserSignUp);
router.post("/login", userController.postUserLogin);
router.get(
  "/download",
  userauthentication.authenticate,
  expenseController.downloadExpenses
);
module.exports = router;
