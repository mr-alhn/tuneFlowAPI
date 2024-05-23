const WebSocket = require("ws");
const Room = require("./models/rooms");
const UserState = require("./models/users");

const rooms = {};
const users = {};
const musics = {};

function handleWebSocket(server) {
  const wsServer = new WebSocket.Server({ server });

  wsServer.on("connection", async (ws) => {
    handlerConnetion();
    ws.on("message", async (message) => {
      handleMessage(ws, JSON.parse(message));
    });

    ws.on("close", () => {
      handerLeft();
      handleDisconnect(ws);
    });
  });
}

async function handlerConnetion() {
  let userState = await UserState.findByPk(1);
  if (!userState) {
    userState = await UserState.create({ count: 0 });
  }

  userState.count++;
  await userState.save();
}

async function handerLeft() {
  let userState = await UserState.findByPk(1);
  userState.count--;
  await userState.save();
  return;
}

function handleMessage(ws, message) {
  switch (message.type) {
    case "create":
      handleCreateRoom(ws, message);
      break;
    case "join":
      handleJoinRoom(ws, message);
      break;
    case "leave":
      handleLeaveRoom(ws, message);
      break;
    case "message":
      handleMessageInRoom(ws, message);
      break;
    case "updatePosition":
      handlePositionUpdate(ws, message);
      break;
    case "seekPosition":
      handleSeekPosition(ws, message);
      break;
    case "changeIndex":
      handleChangeIndex(ws, message);
      break;
    case "changePlaylist":
      handleChangePlaylist(ws, message);
      break;
    case "addQueue":
      handleAddQueue(ws, message);
      break;
    case "playbackState":
      handlePlaybackState(ws, message);
      break;
    case "closeRoom":
      handleCloseRoom(ws, message);
      break;
    case "removeUser":
      removeUsers(message);
      break;
  }
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 11);
}

async function handleCreateRoom(ws, message) {
  const user = users[message.clientId];
  if (user) {
    ws.send(
      JSON.stringify({ type: "fail", message: "You'r already in a room" })
    );
    return;
  }

  let roomId = generateUniqueId();
  const { clientId, name, playlist, lat, lng, city, country, isPrivate } =
    message;

  while (rooms[roomId]) {
    roomId = generateUniqueId();
  }

  rooms[roomId] = [{ id: clientId, ws }];
  musics[roomId] = {
    id: clientId,
    playlist,
    currentIndex: message.index,
    position: 0,
    isPlaying: true,
  };
  users[clientId] = { id: clientId, name, ws };
  ws.send(JSON.stringify({ type: "created", roomId }));
  await Room.create({
    lat,
    lng,
    city,
    country,
    roomId,
    user: users[clientId],
    room: rooms[roomId],
    usersCount: 1,
    isPrivate,
  });
}

async function handleJoinRoom(ws, message) {
  const { roomId, clientId, name } = message;
  const user = users[clientId];
  if (user) {
    ws.send(
      JSON.stringify({ type: "fail", message: "You'r already in a room" })
    );
    return;
  }
  if (!rooms[roomId]) {
    ws.send(JSON.stringify({ type: "fail", message: "Room not found" }));
    return;
  }
  rooms[roomId].push({ id: clientId, ws });
  users[clientId] = { id: clientId, name, ws };
  ws.send(JSON.stringify({ type: "joined", room: musics[roomId] }));
  rooms[roomId].forEach((client) => {
    if (client.ws !== ws) {
      client.ws.send(
        JSON.stringify({ type: "userJoined", user: users[clientId] })
      );
    }
  });
  const room = await Room.findOne({ where: { roomId } });
  if (room) {
    await room.update({ usersCount: room.usersCount + 1 });
  }
}

async function handleLeaveRoom(ws, message) {
  const { roomId, clientId } = message;
  rooms[roomId] = rooms[roomId].filter((client) => client.ws !== ws);
  rooms[roomId].forEach((client) => {
    client.ws.send(JSON.stringify({ type: "userLeft", user: users[clientId] }));
  });
  delete users[clientId];
  const room = await Room.findOne({ where: { roomId } });
  if (room) {
    await room.update({ usersCount: room.usersCount - 1 });
  }
}

function handleMessageInRoom(ws, message) {
  const { roomId, text, name, clientId } = message;
  rooms[roomId].forEach((client) => {
    client.ws.send(
      JSON.stringify({ type: "message", text, user: name, clientId })
    );
  });
}

function handlePositionUpdate(ws, message) {
  const { roomId, position } = message;
  musics[roomId].position = position;
}

function handleSeekPosition(ws, message) {
  const { roomId, position } = message;
  musics[roomId].position = position;
  rooms[roomId].forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: "seekPosition",
        position,
        user: users[message.clientId],
      })
    );
  });
}

function handleChangeIndex(ws, message) {
  const { roomId } = message;
  musics[roomId].currentIndex = message.index;
  rooms[roomId].forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: "changeIndex",
        currentIndex: musics[roomId].currentIndex,
        user: users[message.clientId],
      })
    );
  });
}

function handleChangePlaylist(ws, message) {
  const { roomId } = message;
  musics[roomId].playlist = message.playlist;
  musics[roomId].currentIndex = message.index;
  musics[roomId].position = 0;
  rooms[roomId].forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: "changePlaylist",
        playlist: musics[roomId].playlist,
        index: message.index,
        user: users[message.clientId],
      })
    );
  });
}

function handleAddQueue(ws, message) {
  const { roomId } = message;
  let oldPlaylist = musics[roomId].playlist;
  const newPlaylist = [...oldPlaylist, ...message.playlist];
  musics[roomId].playlist = newPlaylist;
  rooms[roomId].forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: "addQueue",
        playlist: message.playlist,
        user: users[message.clientId],
      })
    );
  });
}

async function handleDisconnect(ws) {
  let disconnectedUserId;
  for (const userId in users) {
    if (users[userId].ws === ws) {
      disconnectedUserId = userId;
      break;
    }
  }
  if (disconnectedUserId) {
    let isOwnerOfRoom = false;
    let roomIdOfOwner = null;

    for (const roomId in rooms) {
      const owner = rooms[roomId][0];
      if (owner.id === disconnectedUserId) {
        isOwnerOfRoom = true;
        roomIdOfOwner = roomId;
        break;
      }
    }

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(
        (client) => client.id !== disconnectedUserId
      );

      rooms[roomId].forEach(async (client) => {
        client.ws.send(
          JSON.stringify({
            type: "userLeft",
            user: users[disconnectedUserId],
          })
        );
      });

      const room = await Room.findOne({ where: { roomId } });
      if (room) {
        await room.update({ usersCount: room.usersCount - 1 });
      }

      if (isOwnerOfRoom && roomId === roomIdOfOwner) {
        rooms[roomId].forEach(async (client) => {
          client.ws.send(
            JSON.stringify({
              type: "roomEnded",
              roomId: roomId,
            })
          );
        });

        delete rooms[roomId];
        delete musics[roomId];
        await Room.destroy({ where: { roomId: roomId } });
      }
    }

    delete users[disconnectedUserId];
  }
}

function handlePlaybackState(ws, message) {
  const { roomId } = message;
  musics[roomId].isPlaying = message.isPlaying;
  rooms[roomId].forEach((client) => {
    client.ws.send(
      JSON.stringify({
        type: "playbackState",
        isPlaying: musics[roomId].isPlaying,
        user: users[message.clientId],
      })
    );
  });
}

function removeUsers(message) {
  const { id } = message;
  const user = users[id];
  if (user) {
    if (user) {
      user.ws.send(JSON.stringify({ type: "removed" }));
    }
    delete users[id];
  }
}

async function handleCloseRoom(ws, message) {
  for (const roomId in rooms) {
    const roomClients = rooms[roomId].map((client) => client.id);
    if (roomClients.includes(message.clientId)) {
      rooms[roomId].forEach((client) => {
        client.ws.send(JSON.stringify({ type: "roomEnded" }));
        delete users[client.id];
      });
      delete rooms[roomId];
      delete musics[roomId];
      deletedRoomId = roomId;
      isRoomEnded = true;
      break;
    }
  }
  if (isRoomEnded) {
    const room = await Room.findOne({ where: { roomId: deletedRoomId } });
    if (room) {
      await room.destroy();
    }
  }
}

module.exports = handleWebSocket;
