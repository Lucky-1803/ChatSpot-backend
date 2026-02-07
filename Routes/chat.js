const express = require("express")
const router = express.Router();
const fetchuser = require("../Middleware/fetchuser");
const Chat = require("../Models/Chat");
const User = require("../Models/User");

// fetch chat
router.get("/fetchChat/:chatid", fetchuser, async (req, res) => {
  try {
    console.log("ChatID from URL:", req.params.chatid);

    const chat = await Chat.findById(req.params.chatid).populate("users", "name username");

    console.log("Chat found:", chat);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat);

  } catch (error) {
    console.error("Error fetching chat:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



// Get all Chats

router.get("/getallChats", fetchuser, async (req, res) => {
  try {
    const chats = await Chat.find({
       users: { $in: [req.user.id] }
    }).populate("users" , "name username")
    res.json(chats);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create group chat

router.post("/group", fetchuser, async (req, res) => {
  const {name ,users} = req.body

  if(!name || !users){
    return res.status(400).json({error: "Name & Users are required"})
  }
  try {

    let parsedUsers = users
    if (typeof users === "string"){
      parsedUsers = JSON.parse(users)
    }

    const group = await Chat.create({
        isGroupChat: true,
        groupAdmin: req.user.id,
        users: [...parsedUsers , req.user.id],
        chatName: name
    })
    res.json(group)
  } catch (error) {
    console.log(error);
  }
});

// Add user in group

router.post("/adduser", fetchuser , async(req,res)=>{
    const {chatid , userid} = req.body

    try{
        const updated = await Chat.findByIdAndUpdate(
            chatid,
            {$push:{users:userid}},
            {new:true}
        )
        res.json(updated)
    }catch(error){
        return res.status(500).json({error:"Internal server error"})
    }
})

// Delete user in group

router.put("/removeuser", fetchuser , async(req , res)=>{
  const {chatid , userid} = req.body

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatid,
      {$pull : {users : userid}},
      {new : true}
    )
    res.json(removed)
  }catch(error){
    return res.status(500).json({error : "Internal server error"})
  }
})

router.delete("/deletechat/:chatId", fetchuser, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // find chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, msg: "Chat not found" });
    }

    // security: only chat users can delete
    const isMember = chat.users.some(
      u => String(u) === String(userId)
    );

    if (!isMember) {
      return res.status(401).json({ success: false, msg: "Not allowed" });
    }

    // HARD DELETE
    await Chat.findByIdAndDelete(chatId);

    res.json({ success: true, msg: "Chat deleted permanently" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});



module.exports = router