const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/room", require("./controllers/rooms"));
app.use("/playlist", require("./controllers/playlist"));
app.use("/report", require("./controllers/report"));

module.exports = app;
