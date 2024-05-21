const express = require("express");
const router = express.Router();
const Playlist = require("../models/playlist");

router.post("/create", async (req, res) => {
  try {
    const { userId, name, image } = req.body;
    const playlist = await Playlist.create({ userId, name, image });
    res
      .status(201)
      .json({ status: true, message: "Playlist created", id: playlist.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

router.get("/get/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const playlists = await Playlist.findAll({ where: { userId } });
    res.status(200).json({ status: true, playlists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;
    const playlist = await Playlist.findByPk(id);

    if (!playlist) {
      return res
        .status(404)
        .json({ status: false, message: "Playlist not found" });
    }

    if (name) {
      playlist.name = name;
    }
    if (image) {
      playlist.image = image;
    }

    res.status(200).json({ status: true, message: "Playlist updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findByPk(id);
    if (!playlist) {
      return res
        .status(404)
        .json({ status: false, message: "Playlist not found" });
    }
    await playlist.destroy();
    res.status(200).json({ status: true, message: "Playlist deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

router.put("/add/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { songId, song } = req.body;
    const playlist = await Playlist.findByPk(id);
    if (!playlist) {
      return res
        .status(404)
        .json({ status: false, message: "Playlist not found" });
    }

    const oldSongs = playlist.songs;
    const oldSongsIds = playlist.songIds;
    const newSongs = [song, ...oldSongs];
    const newSongsIds = [songId, ...oldSongsIds];
    playlist.songs = newSongs;
    playlist.songIds = newSongsIds;
    await playlist.save();
    res.status(200).json({ status: true, message: "Song added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

router.put("/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const playlist = await Playlist.findByPk(id);
    if (!playlist) {
      return res
        .status(404)
        .json({ status: false, message: "Playlist not found" });
    }
    const oldSongs = playlist.songs;
    const oldSongsIds = playlist.songIds;
    const newSongs = oldSongs.filter((song) => song.id !== songId);
    const newSongsIds = oldSongsIds.filter((songId) => songId !== songId);
    playlist.songs = newSongs;
    playlist.songIds = newSongsIds;
    await playlist.save();
    res.status(200).json({ status: true, message: "Song removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
