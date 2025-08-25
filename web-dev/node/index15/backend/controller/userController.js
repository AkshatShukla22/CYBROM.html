const userModel = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userRegistration = async (req, res) => {
  const { email, username, password } = req.body;

  // Incrypting password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await userModel.create({ email:email, username:username, password:hashedPassword });
  res.status(201).json({ message: 'User registered successfully', user });
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email' });
  }

  // Comparing incripted passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  // using jsonwebtoken to create a token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' });
  res.send({ token:token });

};

const userAuth= async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.json({ message: 'User is authenticated', user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}


module.exports = {
  userRegistration,
  userLogin,
  userAuth,
};
