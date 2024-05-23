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
  },
  songIds: {
    type: DataTypes.JSON,
  },
  users: {
    type: DataTypes.JSON,
  },
  isMine: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  playlistId: {
    type: DataTypes.STRING,
  },
});

module.exports = Playlist;
