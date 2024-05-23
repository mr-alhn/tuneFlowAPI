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
  },
  room: {
    type: DataTypes.JSON,
  },
  usersCount: {
    type: DataTypes.INTEGER,
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = Room;
