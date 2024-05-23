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
    allowNull: false,
    defaultValue: [],
    get() {
      return JSON.parse(this.getDataValue("songs"));
    },
  },
  songIds: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      return JSON.parse(this.getDataValue("songIds"));
    },
  },
  users: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    get() {
      return JSON.parse(this.getDataValue("songIds"));
    },
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
