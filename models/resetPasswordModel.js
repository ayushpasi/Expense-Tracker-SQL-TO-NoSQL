// resetpassword.js
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ResetPassword = sequelize.define("resetpassword", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = ResetPassword;
