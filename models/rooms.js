const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Room = db.define("rooms", {
  lat: {
    type: DataTypes.STRING,
  },
  lng: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  country: {
    type: DataTypes.STRING,
  },
  roomId: {
    type: DataTypes.STRING,
  },
  user: {
    type: DataTypes.JSON,
    get() {
      return JSON.parse(this.getDataValue("user"));
    },
  },
  room: {
    type: DataTypes.JSON,
    get() {
      return JSON.parse(this.getDataValue("room"));
    },
  },
  usersCount: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Room;
