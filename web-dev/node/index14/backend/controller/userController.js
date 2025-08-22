const userModel = require("../model/userModel");

const userRegistration = async (req, res) => {
  const { email, username, password } = req.body;
  const user = await userModel.create({ email:email, username:username, password:password });
  res.status(201).json({ message: 'User registered successfully', user });
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email' });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  res.status(200).json({ message: 'User logged in successfully', user });
};


module.exports = {
  userRegistration,
  userLogin,
};
