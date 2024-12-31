// server.js
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

const users = new Map();

function broadcastUserList() {
  const userList = Array.from(users.values).map((user) => ({
    userId: user.userId,
    username: user.username,
    online: true,
  }));

  broadcast({
    type: "userList",
    users: userList,
  });
}

function broadcast(message, excludeUser = null) {
  const messageStr = JSON.stringify(message);
  users.forEach((user) => {
    if (user.ws.readyState === WebSocket.OPEN && user !== excludeUser) {
      user.ws.send(messageStr);
    }
  });
}

server.on("connection", (ws) => {
  clients.add(ws);
  // Send welcome message

  // Handle incoming messages
  ws.on("message", (data) => {
    const { text } = JSON.parse(data);

    switch (text.type) {
      case "login":
        users.set(text.userId, {
          ws,
          userId: text.userId,
          username: text.username.slice(0, 50), // Limit username length
        });
        ws.send(
          JSON.stringify({
            type: "login_success",
            text: `Welcome ${text.username}!`,
          })
        );
        // broadcast(
        //   {
        //     type: "user_joined",
        //     userId: text.userId,
        //     username: text.username,
        //   },
        //   users.get(userId)
        // );
        broadcastUserList();

        break;

      default:
        break;
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on port 8080");
