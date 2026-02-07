const Message = require("../Models/Message");
const express = require("express");
const router = express.Router()
const fetchuser = require("../Middleware/fetchuser")
const Chat = require("../Models/Chat")

// create chat

router.post("/createchat", fetchuser, async (req, res) => {
  try {
    const { receiverid } = req.body;
    if (!receiverid) {
      return res.status(400).json({ error: "Receiverid is required" });
    }

    let existingChat = await Chat.findOne({
      users: { $all: [req.user.id, receiverid] }
    }).populate("users", "name username");

    if (existingChat) {
      return res.json({ success: true, chat: existingChat });
    }

    const chat = new Chat({ users: [req.user.id, receiverid] });
    await chat.save();
    await chat.populate("users", "name username");

    return res.json({ success: true, chat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// send message

router.post("/sendmsg/:chatid",fetchuser,async (req,res)=>{

    const {content} = req.body

    try{
        let msg = new Message({
            chat : req.params.chatid,
            sender : req.user.id,
            content : req.body.content
        })
        await msg.save()

        msg = await msg.populate("sender" , "name username")

        await Chat.findByIdAndUpdate(req.params.chatid , {
            latestMessage: msg
        })
        const io = req.app.get("io")
        io.to(req.params.chatid).emit("messageReceived",msg)
    
        res.json(msg)
    }catch(error){
        return res.status(500).json({error:"internal server error"})
    }
    })
    

// get all messages of chat

router.get("/allMsgs/:chatid" , fetchuser , async(req,res)=>{

    try{
        const msgs = await Message.find({chat:req.params.chatid}).populate("sender","name username ")
        res.json(msgs)
    }catch(error){
        return res.status(500).json({error:"internal server error"})
    }
})


// edit message 

router.put("/editmsg/:msgid" , fetchuser , async (req,res)=>{
    const {content} = req.body
    try{
        let msg = await Message.findById(req.params.msgid)

        if(!msg){
            return res.status(404).json({error:"Message not found"})
        }
        if(msg.sender.toString()!== req.user.id){
            return res.status(401).json({error: "You are not authorized to edit message"})
        }

        msg.content = content;
        msg.edited = true

        await msg.save()

        res.json({success:true , msg})
    }catch(error){
    return res.status(500).json({error:"Internal server error"})
    }
})


// Delete message


router.delete("/deletemsg/:msgid", fetchuser, async (req,res)=>{
    try {
        let msg = await Message.findById(req.params.msgid)

        if(!msg){
            return res.status(404).json({error:"Message not found"})
        }
        
        if(msg.sender.toString()!== req.user.id){
            return res.status(401).json({error: "You are not allowed to delete message."})
        }

        await msg.deleteOne()

        res.json({success:true , message:"Message deleted successfully"})
    }catch(error){
        return res.status(500).json({error:"Internal server error"})
    }

})


module.exports = router 