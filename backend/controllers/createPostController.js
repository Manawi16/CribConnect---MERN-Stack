const Post = require('../models/post');

const createPost = async (req, res) => {
  try {
    const { user_id, title, body, isRommatePost } = req.body;
    const files = req.files;

    const imagePaths = files.map(file => `/uploads/${file.filename}`); // Relative path

    const newPost = new Post({
      user_id,
      title,
      body,
      isRommatePost: isRommatePost === 'true',
      images: imagePaths,
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created', post: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createPost };
