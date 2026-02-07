const mongoose = require("mongoose");
const {Schema} = mongoose

const ChatSchema = new Schema({
    chatName:{
        type: String,
        trim : true
    },
    isGroupChat:{
        type:Boolean,
        default:false
    },
    latestMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
},{timestamps:true})

const Chat = mongoose.model("Chat",ChatSchema)
module.exports = Chat