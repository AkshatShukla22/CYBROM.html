// controllers/supportController.js
const Support = require('../models/Support');
const User = require('../models/User');

// Create Support Ticket (User)
exports.createTicket = async (req, res) => {
  try {
    console.log('[CREATE TICKET] Request received');
    console.log('[CREATE TICKET] req.user:', req.user);
    console.log('[CREATE TICKET] req.body:', req.body);
    console.log('[CREATE TICKET] req.files:', req.files);

    const { subject, problemDetail } = req.body;
    const userId = req.user.id; // Using req.user.id from JWT token

    if (!userId) {
      console.error('[CREATE TICKET] No userId found in req.user');
      return res.status(401).json({ message: 'User ID not found. Please log in again.' });
    }

    if (!subject || !problemDetail) {
      return res.status(400).json({ message: 'Subject and problem detail are required' });
    }

    console.log('[CREATE TICKET] Looking for user with ID:', userId);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.error('[CREATE TICKET] User not found with ID:', userId);
      return res.status(404).json({ message: 'User not found. Please log in again.' });
    }

    console.log('[CREATE TICKET] User found:', user.username);

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(file.filename);
      });
      console.log('[CREATE TICKET] Images uploaded:', images);
    }

    // Create support ticket
    const supportTicket = new Support({
      user: userId,
      userName: user.username,
      userEmail: user.email,
      subject,
      problemDetail,
      images,
      messages: [{
        sender: 'user',
        message: problemDetail,
        timestamp: new Date()
      }]
    });

    await supportTicket.save();
    console.log('[CREATE TICKET] Ticket created successfully:', supportTicket._id);

    res.status(201).json({
      message: 'Support ticket created successfully!',
      ticket: supportTicket
    });
  } catch (error) {
    console.error('[CREATE TICKET] Error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.',
      error: error.message 
    });
  }
};

// Get User's Tickets
exports.getUserTickets = async (req, res) => {
  try {
    console.log('[GET USER TICKETS] Request received');
    const userId = req.user.id;

    console.log('[GET USER TICKETS] Fetching tickets for user:', userId);

    const tickets = await Support.find({ user: userId })
      .sort({ updatedAt: -1 });

    console.log('[GET USER TICKETS] Found tickets:', tickets.length);

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('[GET USER TICKETS] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Single Ticket Details
exports.getTicketById = async (req, res) => {
  try {
    console.log('[GET TICKET BY ID] Request received');
    const { id } = req.params;
    const userId = req.user.id;

    console.log('[GET TICKET BY ID] Ticket ID:', id);
    console.log('[GET TICKET BY ID] User ID:', userId);

    const ticket = await Support.findById(id);

    if (!ticket) {
      console.log('[GET TICKET BY ID] Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user owns this ticket
    if (ticket.user.toString() !== userId) {
      console.log('[GET TICKET BY ID] Access denied - user does not own ticket');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('[GET TICKET BY ID] Ticket found and authorized');

    res.status(200).json({ ticket });
  } catch (error) {
    console.error('[GET TICKET BY ID] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add Message to Ticket (User)
exports.addMessage = async (req, res) => {
  try {
    console.log('[ADD MESSAGE] Request received');
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    console.log('[ADD MESSAGE] Ticket ID:', id);
    console.log('[ADD MESSAGE] User ID:', userId);
    console.log('[ADD MESSAGE] Message:', message);

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ticket = await Support.findById(id);

    if (!ticket) {
      console.log('[ADD MESSAGE] Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user owns this ticket
    if (ticket.user.toString() !== userId) {
      console.log('[ADD MESSAGE] Access denied - user does not own ticket');
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.messages.push({
      sender: 'user',
      message,
      timestamp: new Date()
    });

    if (ticket.status === 'closed') {
      ticket.status = 'open';
    }

    await ticket.save();
    console.log('[ADD MESSAGE] Message added successfully');

    res.status(200).json({
      message: 'Message added successfully',
      ticket
    });
  } catch (error) {
    console.error('[ADD MESSAGE] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ADMIN FUNCTIONS

// Get All Tickets (Admin)
exports.getAllTickets = async (req, res) => {
  try {
    console.log('[GET ALL TICKETS] Request received (Admin)');
    const tickets = await Support.find()
      .populate('user', 'username email')
      .sort({ updatedAt: -1 });

    console.log('[GET ALL TICKETS] Found tickets:', tickets.length);

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('[GET ALL TICKETS] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get Single Ticket (Admin)
exports.getTicketByIdAdmin = async (req, res) => {
  try {
    console.log('[GET TICKET BY ID ADMIN] Request received');
    const { id } = req.params;

    const ticket = await Support.findById(id)
      .populate('user', 'username email');

    if (!ticket) {
      console.log('[GET TICKET BY ID ADMIN] Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    console.log('[GET TICKET BY ID ADMIN] Ticket found');

    res.status(200).json({ ticket });
  } catch (error) {
    console.error('[GET TICKET BY ID ADMIN] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add Admin Reply
exports.addAdminReply = async (req, res) => {
  try {
    console.log('[ADD ADMIN REPLY] Request received');
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ticket = await Support.findById(id);

    if (!ticket) {
      console.log('[ADD ADMIN REPLY] Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.messages.push({
      sender: 'admin',
      message,
      timestamp: new Date()
    });

    ticket.status = 'in-progress';
    await ticket.save();

    console.log('[ADD ADMIN REPLY] Reply sent successfully');

    res.status(200).json({
      message: 'Reply sent successfully',
      ticket
    });
  } catch (error) {
    console.error('[ADD ADMIN REPLY] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update Ticket Status (Admin)
exports.updateTicketStatus = async (req, res) => {
  try {
    console.log('[UPDATE TICKET STATUS] Request received');
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await Support.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      console.log('[UPDATE TICKET STATUS] Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    console.log('[UPDATE TICKET STATUS] Status updated successfully');

    res.status(200).json({
      message: 'Status updated successfully',
      ticket
    });
  } catch (error) {
    console.error('[UPDATE TICKET STATUS] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete Ticket (Admin)
exports.deleteTicket = async (req, res) => {
  try {
    console.log('[DELETE TICKET] Request received');
    const { id } = req.params;
    const fs = require('fs');
    const path = require('path');

    const ticket = await Support.findById(id);

    if (!ticket) {
      console.log('[DELETE TICKET] Ticket not found');
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Delete associated images
    if (ticket.images && ticket.images.length > 0) {
      ticket.images.forEach(image => {
        const filePath = path.join(__dirname, '../uploads', image);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('[DELETE TICKET] Deleted image:', image);
        }
      });
    }

    await Support.findByIdAndDelete(id);
    console.log('[DELETE TICKET] Ticket deleted successfully');

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('[DELETE TICKET] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};