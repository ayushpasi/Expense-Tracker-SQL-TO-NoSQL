const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
router.use(express.static("public"));

router.get("/", expenseController.getHomePage);

router.post("/add-expense", expenseController.addExpense);

router.delete("/delete-expense/:id", expenseController.deleteExpense);

router.put("/edit-expense/:id", expenseController.editExpense);

router.get(
  "/get-all-expenses/:page",
  expenseController.getAllExpensesforPagination
);

module.exports = router;
