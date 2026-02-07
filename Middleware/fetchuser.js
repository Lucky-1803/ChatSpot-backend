const jwt = require("jsonwebtoken");
const JWT_SECRET = "luckysharma";

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ error: "No token provided" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    console.log("TOKEN DECODED:", data);
    req.user = data.user;
    next();
  } catch (error) {
    console.log("JWT VERIFY ERROR:", error.message);
    return res.status(401).send({ error: "Invalid or expired token" });
  }
};

module.exports = fetchuser;
