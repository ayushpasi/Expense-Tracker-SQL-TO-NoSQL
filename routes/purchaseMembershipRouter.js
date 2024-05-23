const express = require("express");

const purchaseMembershipController = require("../controllers/purchaseMembershipController");

const userauthentication = require("../middleware/authentication");

const router = express.Router();

router.get(
  "/premium-membership",
  userauthentication.authenticate,
  purchaseMembershipController.purchasepremium
);

router.post(
  "/update-transaction-status",
  userauthentication.authenticate,
  purchaseMembershipController.updateTransactionStatus
);

module.exports = router;
