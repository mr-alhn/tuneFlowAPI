const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",
  username: "u649017904_music",
  password: "Alhn@2024",
  database: "u649017904_music",
  host: "srv1258.hstgr.io",
  port: 3306,
});

module.exports = sequelize;
