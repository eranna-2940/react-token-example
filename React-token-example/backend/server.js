const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Initialize dotenv to read environment variables
dotenv.config();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
const db = pool.promise();

let refreshTokens = [];

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

app.delete("/logout", (req, res) => {
  const tokenToDelete = req.headers["token"];
  refreshTokens = refreshTokens.filter((token) => token !== tokenToDelete);
  res.sendStatus(204);
});

function generateAccessToken({ user }) {
  return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "24h",
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // console.log(err);
    if (err) return res.sendStatus(403);
    // console.log(req.user, user);
    req.user = user;
    next();
  });
}
// Initialize Express app
const app = express();
app.use(express.json());  // To parse JSON request bodies
app.post("/user", (req, res) => {
  const sql = "SELECT * FROM register WHERE `email` = ? AND `password` = ?";
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      const accessToken = generateAccessToken({data})
      // console.log(accessToken)
      const refreshToken = jwt.sign({data}, process.env.REFRESH_TOKEN_SECRET)
      refreshTokens.push(refreshToken)
      // const token = jwt.sign({data}, secretKey, { expiresIn: '1h' });
      return res.json({accessToken, data});
      // return res.json(data);
    } else {
      return res.json("Fail");
    }
  });
});

app.post("/admin", (req, res) => {
  const sql = "SELECT * FROM admin WHERE `email` = ? AND `password` = ?";
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      const accessToken = generateAccessToken({data})
      // console.log(accessToken)
      const refreshToken = jwt.sign({data}, process.env.REFRESH_TOKEN_SECRET)
      refreshTokens.push(refreshToken)
      // const token = jwt.sign({data}, secretKey, { expiresIn: '1h' });
      return res.json({accessToken, data});
      // return res.json(data);
    } else {
      return res.json("Fail");
    }
  });
});

app.get("/admin",authenticateToken, (req, res) => {
  const sql ="SELECT * FROM admin";;
  db.query(sql, (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      return res.json(data);
    } else {
      return res.json("Fail");
    }
  });
});

app.get("/user",authenticateToken, (req, res) => {
  const sql =  "SELECT * FROM register";
  db.query(sql, (err, data) => {
    if (err) {
      return res.json("Error");
    }
    if (data.length > 0) {
      return res.json(data);
    } else {
      return res.json("Fail");
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
