import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { initDb, saveMessage, getRecentMessages, cleanOldMessages } from "./db.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const users = new Map();
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;
const MIN_USERNAME_LENGTH = 3;
const CLEANUP_INTERVAL = 60 * 60 * 1000;

function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "Username is required" };
  }

  const trimmed = username.trim();

  if (trimmed.length < MIN_USERNAME_LENGTH) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Username can only contain letters and numbers",
    };
  }

  const taken = Array.from(users.values()).some(
    (u) => u.username.toLowerCase() === trimmed.toLowerCase()
  );

  if (taken) {
    return { valid: false, error: "Username is already taken" };
  }

  return { valid: true, username: trimmed };
}

function broadcast(data, exclude) {
  const message = JSON.stringify(data);
  for (const [id, user] of users) {
    if (id !== exclude && user.ws.readyState === 1) {
      user.ws.send(message);
    }
  }
}

wss.on("connection", (ws) => {
  let userId = null;

  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
      return;
    }

    if (data.type === "join") {
      const result = validateUsername(data.username);
      if (!result.valid) {
        ws.send(JSON.stringify({ type: "error", error: result.error }));
        return;
      }

      userId = uuidv4();
      users.set(userId, { username: result.username, ws });

      try {
        const history = await getRecentMessages();
        ws.send(
          JSON.stringify({
            type: "joined",
            userId,
            username: result.username,
            onlineUsers: Array.from(users.values()).map((u) => u.username),
            history,
          })
        );
      } catch (err) {
        console.error("Failed to load history:", err.message);
        ws.send(
          JSON.stringify({
            type: "joined",
            userId,
            username: result.username,
            onlineUsers: Array.from(users.values()).map((u) => u.username),
            history: [],
          })
        );
      }

      broadcast(
        {
          type: "user_joined",
          username: result.username,
          onlineUsers: Array.from(users.values()).map((u) => u.username),
        },
        userId
      );
      return;
    }

    if (data.type === "message") {
      if (!userId || !users.has(userId)) {
        ws.send(
          JSON.stringify({ type: "error", error: "You must join before sending messages" })
        );
        return;
      }

      const text = data.text?.trim();
      if (!text) {
        ws.send(JSON.stringify({ type: "error", error: "Message cannot be empty" }));
        return;
      }

      const user = users.get(userId);
      const chatMessage = {
        type: "message",
        id: uuidv4(),
        username: user.username,
        text,
        timestamp: new Date().toISOString(),
      };

      try {
        await saveMessage(chatMessage);
      } catch (err) {
        console.error("Failed to save message:", err.message);
      }

      broadcast(chatMessage);
      return;
    }

    ws.send(JSON.stringify({ type: "error", error: "Unknown message type" }));
  });

  ws.on("close", () => {
    if (userId && users.has(userId)) {
      const user = users.get(userId);
      users.delete(userId);
      broadcast({
        type: "user_left",
        username: user.username,
        onlineUsers: Array.from(users.values()).map((u) => u.username),
      });
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  await initDb();
  console.log("Database initialized");

  setInterval(async () => {
    try {
      const deleted = await cleanOldMessages();
      if (deleted > 0) {
        console.log(`Cleaned ${deleted} messages older than 2 days`);
      }
    } catch (err) {
      console.error("Cleanup failed:", err.message);
    }
  }, CLEANUP_INTERVAL);

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
