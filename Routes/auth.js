const express = require("express");
const User = require("../Models/User");
const Friends = require("../Models/Friends")
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const fetchuser = require("../Middleware/fetchuser");
const JWT_SECRET = "luckysharma";

// Signup

router.post(
  "/createuser",
  [
    body("username", "Enter a username").isLength({ min: 5 }),
    body("name", "Enter a name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter a valid password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ success : true ,authtoken });
      //   res.json({ user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Failed to Sign Up!");
    }
  }
);

// logIn

router.post(
  "/login",
  [
    body("identifier", "Enter valid email or username").exists(),
    body("password", "Enter valid password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { identifier, password } = req.body;
    identifier = identifier.trim()
    try {
      let user;
      if (identifier.includes("@")) {
        user = await User.findOne({ email: identifier });
      } else {
        user = await User.findOne({ username: identifier });
      }

      if (!user) {
        return res.status(400).json({ error: "Invalid credetials" });
      }

      let comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(400).json({ error: "Invalid Credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({success:true, authtoken,
        userid : user._id,
        user :{
          _id :user._id,
          name : user.name,
          username: user.username
        }
       });
      //   res.json({ user });
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Login Failed!");
    }
  }
);

// get user

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userid = req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ error: "User not Found!" });
  }
});

// get user info 

router.get("/userinfo/:id", fetchuser , async (req,res)=>{
  try{
    const user = await User.findById(req.params.id).select("-password")
    res.json(user)
  }catch(error){
    console.log(error.message)
    return res.status(500).send({error : "User not found!"})
  }
})

// get all users

router.get("/getallusers",fetchuser , async(req,res)=>{
  try{
    const loggedIn = req.user.id

    const sent = await Friends.find({
      sender : loggedIn,
      status : "pending"
    }).select("receiver")

    const received = await Friends.find({
      receiver : loggedIn,
      status : "pending"
    }).select("sender")

    const friends = await Friends.find({
      $or : [
        {sender : loggedIn},
        {receiver : loggedIn}
      ],
      status : "accepted"
    })
    
    const users = await User.find({_id : {$ne:loggedIn}}).select("-password")

    // lists

    const sentIds = sent.map(s => s.receiver.toString())
    const receiveIds = received.map(r => r.sender.toString())
    const friendsIds = friends.map( f =>
     { return f.sender.toString()=== loggedIn ? f.receiver.toString():f.sender.toString()}
    )

    const finalUsers = users.map(u=>{
      let status = "none"
      if(friendsIds.includes(u._id.toString())) status = "friends"
      else if (sentIds.includes(u._id.toString())) status = "sent"
      else if (receiveIds.includes(u._id.toString())) status ="received"

      return {...u._doc , requestStatus : status}
    })
    const filteredUsers = finalUsers.filter(u => !friendsIds.includes(u._id.toString()))
    res.json(filteredUsers)
  }catch(error){
      return res.status(500).send({error : "Something went wrong"});
  }
})


  

module.exports = router;
