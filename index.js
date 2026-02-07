const ConnectToMongo = require("./db");
const express = require("express");
const app = express();
const port = 5000;
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: ["content-type", "auth-token"],
}));

ConnectToMongo();

app.use("/api/auth", require("./Routes/auth"));
app.use("/api/friends", require("./Routes/friends"));
app.use("/api/message", require("./Routes/message"));
app.use("/api/chat", require("./Routes/chat"));

io.on("connection", (socket) => {
  console.log("New Socket connected:", socket.id);

  // Join chat room
  socket.on("joinChat", (chatid) => {
    socket.join(chatid);
    console.log("User joined chat:", chatid);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
app.set("io",io)

server.listen(port, () => {
  console.log(`chatSpot app listening on http://localhost:${port}`);
});
