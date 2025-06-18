const jwt = require("jsonwebtoken");
const logger = require("../logger");
console.log("Auth mResdd");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Authentication failed: Token missing" });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    res.status(401).json({ message: "Authentication failed , Token missing" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // logger.info("Authentication successful", decode);
    req.user = decode;
    next();
  } catch (err) {
    // console.log("Authentication error:", err);
    logger.error("Authentication error:", err);
    res.status(500).json({ message: "Authentication failed. Invalid token." });
  }
};

module.exports = auth;
