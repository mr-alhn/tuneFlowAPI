const express = require("express");
const router = express.Router();
const Room = require("../models/rooms");

router.get("/", async (req, res) => {
  try {
    const { city, country } = req.query;

    const rooms = await Room.findAll({
      where: { city, country, isPrivate: false },
      order: [["usersCount", "DESC"]],
    });

    res.status(200).json({ status: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

router.get("/top", async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { isPrivate: false },
      order: [["usersCount", "DESC"]],
      limit: 10,
    });
    res.status(200).json({ status: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server Error" });
  }
});

module.exports = router;
