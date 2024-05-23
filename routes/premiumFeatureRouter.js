const express = require("express");
const router = express.Router();
const premiumFeatureController = require("../controllers/premiumFeatureController");
const userauthentication = require("../middleware/authentication");

router.get(
  "/show-leader-board",
  userauthentication.authenticate,
  premiumFeatureController.getUserLeaderBoard
);
router.get(
  "/get-leaderboard-page",
  premiumFeatureController.getLeaderboardPage
);

router.get("/get-report-page", premiumFeatureController.getReportsPage);

router.post(
  "/daily-report",
  userauthentication.authenticate,
  premiumFeatureController.dailyReports
);
router.post(
  "/monthly-report",
  userauthentication.authenticate,
  premiumFeatureController.monthlyReports
);

module.exports = router;
