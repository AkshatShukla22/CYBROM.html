// Create a new file: routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const News = require('../models/News');

// Get all news (public route - no authentication required)
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get single news by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.status(200).json({ news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;