const jwt = require("jsonwebtoken");
console.log("Auth mResdd");

const auth = (req, res, next) => {
  console.log("Auth middleware triggered");
  console.log(
    "Auth middleware triggeredyyyyyyyyyyy",
    req.headers.authorization,
    req.headers
  );
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "Authentication failed , Token missing" });
  }
  try {
    const decode = jwt.verify(token, "secret_key");
    req.user = decode;
    next();
  } catch (err) {
    console.log("Authentication error:", err);
    res.status(500).json({ message: "Authentication failed. Invalid token." });
  }
};

module.exports = auth;
