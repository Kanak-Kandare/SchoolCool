import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import connectDB from "./db/mongoose.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./model/users.js";
import authMiddleware from "./middleware/auth.js";

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join("../frontend", "build")));
app.get("/", (req, res) => {
  res.sendFile(path.resolve("../frontend", "build", "index.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      role,
    });
    await newUser.save();

    // JWT
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET
    );
    res.json({ token, role: newUser.role });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/dashboard", async (req, res) => {
  res.sendFile(path.resolve("../frontend", "build", "index.html"));
  console.table( req.header('Authorization'));
})

connectDB.then(() => {
  console.log("Connected to DB");
  app.listen(5000, () => {
    console.log("Server is running on port 5000");
  });
});
