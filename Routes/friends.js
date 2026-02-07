const fetchuser = require("../Middleware/fetchuser")
const express = require("express");
const router = express.Router();
const Friends = require("../Models/Friends")


// Send friend request

router.post("/sendreq/:userid",fetchuser, async (req,res)=>{
    if(req.user.id === req.params.userid){
        return res.status(400).json({success:false, message:"You can't add yourself"})
    }

    const exists = await Friends.findOne({
        sender : req.user.id,
        receiver: req.params.userid
    })
    if(exists){
        return res.status(400).json({success:false,message:"Request already sent"})
    }

    let newreq = new Friends ({
        sender: req.user.id,
        receiver : req.params.userid
    })
    await newreq.save()
    res.json({success:true})
})

// accept friend request 

router.post("/acceptreq/:reqid" , fetchuser , async (req,res)=>{
    const request = await Friends.findOneAndUpdate({
        _id:req.params.reqid,
        receiver: req.user.id,
        status:"pending"
    },{status:"accepted"},
      {new : true})
    if(!request){
        return res.status(401).json({success:false})
    }
    res.json({success : true})
})

// see pending request

router.get("/pendingreq" , fetchuser , async (req,res)=>{
    try {
        const requests = await Friends.find({
            receiver: req.user.id,
            status: "pending"
        }).populate("sender" , "username name")
        
        return res.json(requests)
    }catch(error){
        console.log(error)
        res.status(500).send("Internal server")
    }
})

// Cancel request

router.delete("/cancelreq/:id",fetchuser, async(req,res)=>{
    const request = await Friends.findOneAndDelete({
        _id:req.params.id,
        status: "pending",
        $or : [
          {sender: req.user.id},
          {receiver : req.user.id}          
        ]
    })
    if(!request){
        return res.status(403).json({success:false})
    }
    res.json({success:true})
})

// remove friends

router.delete("/removefriends/:id", fetchuser, async (req, res) => {
  try {
    const myId = req.user.id
    const friendId = req.params.id

    const removed = await Friends.findOneAndDelete({
      status: "accepted",
      $or: [
        { sender: myId , receiver : friendId },
        { receiver: friendId , sender : myId }
      ]
    });

    if (!removed) {
      return res.status(403).json({ success: false });
    }

    res.json({ success: true });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});


// GET MY FRIENDS

router.get("/myfriends", fetchuser, async (req, res) => {
  try {
    const myId = req.user.id;

    const friends = await Friends.find({
      status: "accepted",
      $or: [{ sender: myId }, { receiver: myId }]
    })
      .populate("sender", "name username")
      .populate("receiver", "name username");

    const myFriends = friends
      .filter(f => f.sender && f.receiver) 
      .map(f => {
        if (f.sender._id.toString() === myId) {
          return f.receiver;
        }
        return f.sender;
      });

    res.json(myFriends);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error" });
  }
});



module.exports = router
