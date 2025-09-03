const mongoose = require("mongoose");

const connAuth = mongoose.createConnection("mongodb://localhost:27017/authdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connProfile = mongoose.createConnection("mongodb://localhost:27017/profiledb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const authSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }
});
const Auth = connAuth.model("Auth", authSchema);

const profileSchema = new mongoose.Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, required: true },
  firstName: String,
  lastName: String
});
const Profile = connProfile.model("Profile", profileSchema);

module.exports = { Auth, Profile };
