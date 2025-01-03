// server.js
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

const users = new Map();

function broadcastUserList() {
  console.log("called...");

  const userList = Array.from(users.values()).map((user) => ({
    userId: user.userId,
    username: user.username,
    email: user.email,
    bio: user.bio,
    profileUrl: user.profileUrl,
    online: true,
  }));

  broadcast({
    type: "userList",
    users: userList,
  });
}

function broadcast(message, excludeUser = null) {
  const messageStr = JSON.stringify(message);
  console.log(users, "krekkdf...");
  users.forEach((user) => {
    if (user.ws.readyState === WebSocket.OPEN && user !== excludeUser) {
      console.log("krekkdf4544554...");
      user.ws.send(messageStr);
    }
  });
}

server.on("connection", (ws) => {
  clients.add(ws);
  // Send welcome message

  // Handle incoming messages
  ws.on("message", (data) => {
    const parsedData = JSON.parse(data);
    console.log(parsedData);

    switch (parsedData?.type) {
      case "login":
        users.set(parsedData.userId, {
          ws,
          userId: parsedData.userId,
          username: parsedData.username.slice(0, 50), // Limit username length
          email: parsedData.email,
          bio: parsedData.bio,
          profileUrl: parsedData.profileUrl,
        });
        ws.send(
          JSON.stringify({
            type: "login_success",
            text: `Welcome ${parsedData?.username}!`,
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

      case "authenticate":
        if (parsedData.token) {
          users.set(parsedData.userId, {
            ws,
            userId: parsedData.userId,
            username: parsedData?.username?.slice(0, 50), // Limit username length
            email: parsedData.email,
            bio: parsedData.bio,
            profileUrl: parsedData.profileUrl,
          });
          ws.send(
            JSON.stringify({
              type: "login_success",
              text: `Welcome ${parsedData.username}!`,
            })
          );
          broadcastUserList();
        } else {
          ws.send(
            JSON.stringify({
              type: "login_failed",
            })
          );
        }
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
