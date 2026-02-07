const mongoose = require('mongoose')
const {Schema} = mongoose

const FriendsSchema = new Schema ({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required : true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required : true
    },
    status:{
        type: String,
        enum:["pending","accepted","rejected"],
        default:"pending"
    }
    },{timestamps:true})

    const Friends = mongoose.model("Friends",FriendsSchema)
    module.exports = Friends

