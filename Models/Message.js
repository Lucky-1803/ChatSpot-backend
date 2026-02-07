const mongoose = require("mongoose")
const {Schema}= mongoose


const messageSchema = new Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref : "chat"
    },
    image:{
        type : String
    },
    content: {
        type: String,
        trim: true
    },
    file:{
        type: String
    },
    edited : {
        type : Boolean,
        default : false
    }
},
{timestamps:true}
)

const Message = mongoose.model("Message", messageSchema)
module.exports = Message