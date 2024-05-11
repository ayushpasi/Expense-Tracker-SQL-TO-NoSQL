const express = require("express");
const router = express.Router();
const premiumFeatureController = require("../controllers/premiumFeatureController");
const userauthentication = require("../middleware/authentication");

router.get(
  "/showLeaderBoard",
  userauthentication.authenticate,
  premiumFeatureController.getUserLeaderBoard
);
router.get("/getLeaderboardPage", premiumFeatureController.getLeaderboardPage);

router.get("/getReportsPage", premiumFeatureController.getReportsPage);

router.post(
  "/dailyReports",
  userauthentication.authenticate,
  premiumFeatureController.dailyReports
);
router.post(
  "/monthlyReports",
  userauthentication.authenticate,
  premiumFeatureController.monthlyReports
);

module.exports = router;
