const express = require("express");
const router = express.Router();
const Report = require("../models/report");

router.post("/", async (req, res) => {
  try {
    const { userId, name, email, phone, message } = req.body;
    const report = await Report.create({
      userId,
      name,
      email,
      phone,
      message,
    });
    res
      .status(201)
      .json({ status: true, message: "Report created", id: report.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json({ status: true, reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
