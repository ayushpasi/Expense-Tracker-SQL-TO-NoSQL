const express = require("express");

const purchaseMembershipController = require("../controllers/purchaseMembershipController");

const userauthentication = require("../middleware/authentication");

const router = express.Router();

router.get(
  "/premiumMembership",
  userauthentication.authenticate,
  purchaseMembershipController.purchasepremium
);

router.post(
  "/updateTransactionStatus",
  userauthentication.authenticate,
  purchaseMembershipController.updateTransactionStatus
);

module.exports = router;
