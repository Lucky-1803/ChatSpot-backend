const mongoose = require("mongoose")
const {Schema} = mongoose

const userSchema = new Schema({
    username:{
        type: String,
        required:true,
        unique: true
    },
    name:{
        type: String,
        required:true,
    },
    email:{
        type:String,
        required : true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    sentRequests :[{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    receivedRequests : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }]
    

})

const User = mongoose.model('User',userSchema)
module.exports = User