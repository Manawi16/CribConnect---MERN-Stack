const express = require('express');
const router = express.Router();
const upload = require('../middlewares/imageUpload');
const { createPost } = require('../controllers/createPostController');
const post = require('../models/post'); 
const {routeAuthentication} = require('../middlewares/routeAuthentication');


router.get('/community-posts',async (req, res) => {
    try {
    const posts = await post.find().sort({ date: -1 }); // newest first
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to load posts from database' });
  }
});

router.post('/community/add-posts', routeAuthentication, upload.array('images', 5),createPost);

module.exports = router;
