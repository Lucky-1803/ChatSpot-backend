const ConnectToMongo = require("./db");
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://web-chat-spot-rwhx.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: ["content-type", "auth-token"],
}));

// DB
ConnectToMongo();

// Routes
app.use("/api/auth", require("./Routes/auth"));
app.use("/api/friends", require("./Routes/friends"));
app.use("/api/message", require("./Routes/message"));
app.use("/api/chat", require("./Routes/chat"));

// Socket.io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://web-chat-spot-rwhx.vercel.app",
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("New Socket connected:", socket.id);

  socket.on("joinChat", (chatid) => {
    socket.join(chatid);
    console.log("User joined chat:", chatid);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.set("io", io);

// Start server
server.listen(PORT, () => {
  console.log(`ChatSpot backend running on port ${PORT}`);
});
