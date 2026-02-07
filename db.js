const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://lucky18032:Lucky%405920@cluster.hlnkp0i.mongodb.net/?appName=Cluster";

const ConnectToMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB failed to connect",error);
  }
};

module.exports = ConnectToMongo