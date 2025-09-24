import { randomUUID } from "crypto";
import http from "http";
import url from "url";
import { WebSocketServer, WebSocket } from "ws";

const server = http.createServer();

interface WebSocketConnection extends WebSocket {
  socketId: string;
}

type Users = Map<string, string>;
const users = new Map();

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (connection: WebSocketConnection, request) => {
  if (!request.url) return;

  const { username } = url.parse(request.url, true).query;

  if (!username || typeof username !== "string") return;

  const uuid = randomUUID();
  connection.socketId = uuid;

  users.set(uuid, username);

  // handle socket message events
  connection.on("message", (data: string) => {
    const parsedData = JSON.parse(data);

    console.log(
      `This message is from ${connection.socketId}\nMessage - ${parsedData?.body}`
    );

    console.log(`Connected Clients`, users);
  });

  // handle socket disconnection
  connection.on("close", () => {
    users.delete(connection.socketId);

    console.log(`Connected Clients`, users);
  });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
