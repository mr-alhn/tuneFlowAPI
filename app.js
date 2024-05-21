const http = require("http");
const apis = require("./routes");
const db = require("./config/db");
const handleWebSocket = require("./socket");

db.sync();

const PORT = 3333;

const httpServer = http.createServer(apis);

handleWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});
