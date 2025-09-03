const express = require("express");
const router = express.Router();
const { Auth, Profile } = require("../models/userModel");

// POST /user/add - Add new employee
router.post("/add", async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    // Validate input
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: "Email, firstName, and lastName are required" });
    }

    // Check if email already exists
    const existingAuth = await Auth.findOne({ email });
    if (existingAuth) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newAuth = new Auth({ email });
    const savedAuth = await newAuth.save();

    const newProfile = new Profile({
      authId: savedAuth._id,
      firstName,
      lastName
    });
    await newProfile.save();

    res.status(201).json({ 
      message: "Employee created successfully",
      data: {
        id: savedAuth._id,
        email: savedAuth.email,
        firstName: newProfile.firstName,
        lastName: newProfile.lastName
      }
    });
  } catch (err) {
    console.error("Error in /add route:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /user/all - Get all employees
router.get("/all", async (req, res) => {
  try {
    const auths = await Auth.find();

    const users = await Promise.all(auths.map(async (auth) => {
      try {
        const profile = await Profile.findOne({ authId: auth._id });
        return {
          id: auth._id,
          email: auth.email,
          firstName: profile?.firstName || "",
          lastName: profile?.lastName || ""
        };
      } catch (innerErr) {
        console.error("Profile fetch error for authId:", auth._id, innerErr);
        return {
          id: auth._id,
          email: auth.email,
          firstName: "",
          lastName: ""
        };
      }
    }));

    res.json(users);
  } catch (err) {
    console.error("Error in /all route:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /user/:id - Get employee by ID
router.get("/:id", async (req, res) => {
  try {
    const auth = await Auth.findById(req.params.id);
    if (!auth) return res.status(404).json({ error: "Employee not found" });

    const profile = await Profile.findOne({ authId: auth._id });
    res.json({
      id: auth._id,
      email: auth.email,
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || ""
    });
  } catch (err) {
    console.error("Error in /:id route:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /user/:id - Update employee
router.put("/:id", async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    const auth = await Auth.findById(req.params.id);
    if (!auth) return res.status(404).json({ error: "Employee not found" });

    // Update auth if email provided
    if (email && email !== auth.email) {
      const existingAuth = await Auth.findOne({ email });
      if (existingAuth) {
        return res.status(400).json({ error: "Email already exists" });
      }
      auth.email = email;
      await auth.save();
    }

    // Update profile if firstName or lastName provided
    if (firstName || lastName) {
      await Profile.findOneAndUpdate(
        { authId: auth._id },
        { 
          ...(firstName && { firstName }),
          ...(lastName && { lastName })
        },
        { new: true, upsert: true }
      );
    }

    const updatedProfile = await Profile.findOne({ authId: auth._id });
    res.json({
      id: auth._id,
      email: auth.email,
      firstName: updatedProfile?.firstName || "",
      lastName: updatedProfile?.lastName || ""
    });
  } catch (err) {
    console.error("Error in PUT /:id route:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /user/:id - Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const auth = await Auth.findById(req.params.id);
    if (!auth) return res.status(404).json({ error: "Employee not found" });

    // Delete profile first
    await Profile.deleteOne({ authId: auth._id });
    
    // Delete auth
    await Auth.findByIdAndDelete(req.params.id);

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error in DELETE /:id route:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;