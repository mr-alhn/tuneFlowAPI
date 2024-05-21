const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Playlist = db.define("playlist", {
  userId: {
    type: DataTypes.INTEGER,
  },
  name: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  songs: {
    type: DataTypes.JSON,
    get() {
      return JSON.parse(this.getDataValue("songs"));
    },
  },
  songIds: {
    type: DataTypes.JSON,
    get() {
      return JSON.parse(this.getDataValue("songIds"));
    },
  },
  users: {
    type: DataTypes.JSON,
    get() {
      return JSON.parse(this.getDataValue("songIds"));
    },
  },
});

module.exports = Playlist;
