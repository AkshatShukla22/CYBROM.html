const UserModel = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send("No token provided");
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log(verified.id);
        const User = await UserModel.findById(verified.id);
        if (!User) {
            return res.status(404).send("User not found");
        }
        res.send({ user: User });
    } catch (error) {
        console.error("userAuth error:", error);
        res.status(500).send("Server error");
    }
}

const userRegistration = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const User = await UserModel.create({
            name: name,
            email: email,
            password: hashedPassword
        });
        res.status(201).json({ msg: "You are Successfully Registered!" });
    } catch (error) {
        console.error("userRegistration error:", error);
        res.status(500).json({ msg: "Registration failed" });
    }
}

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        const User = await UserModel.findOne({ email: email });
        if (!User) {
            return res.status(401).send("Invalid Email!");
        }
        
        const validPassword = await bcrypt.compare(password, User.password);
        if (!validPassword) {
            return res.status(401).send("Invalid Password!");
        }

        const token = await jwt.sign({ id: User._id }, process.env.JWT_SECRET, { expiresIn: '7 days' });

        res.send({ token: token });
    } catch (error) {
        console.error("userLogin error:", error);
        res.status(500).send("Login failed");
    }
}

module.exports = {
    userRegistration,
    userLogin,
    userAuth
}