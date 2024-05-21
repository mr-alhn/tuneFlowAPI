const { DataTypes } = require("sequelize");
const db = require("../config/db");

const UserState = db.define("userState", {
  count: {
    type: DataTypes.INTEGER,
  },
});

module.exports = UserState;
