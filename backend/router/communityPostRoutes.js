const express = require('express');
const router = express.Router();
const post = require('../models/post');
require('../models/Account'); 
const comment=require('../models/comment');
const {routeAuthentication} = require('../middlewares/routeAuthentication');
const tenantSchema = require('../models/tenantSchema');

router.get('/:id', routeAuthentication, async (req, res) => {

  try {
    console.log("Fetching post with ID:", req.params.id);
    const postid = req.params.id;
    const userId = req.user._id;

    if (!postid) {
      return res.status(400).json({ message: "postid query param is required." });
    }

    const postResult = await post.findById(postid);
    if (!postResult) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comments = await comment
      .find({ post_id: postid })
      .populate('user_id', 'name profile_url');

    const tenant = await tenantSchema.findOne({ user_id: userId });
    const liked_by_user = tenant?.liked_posts
      .map(p => p.toString())
      .includes(postid.toString()) || false;

    return res.status(200).json({
      postResult,
      comments,
      liked_by_user,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to load posts from database' });
  }
});


router.post('/:postId/addcomment', routeAuthentication,async (req, res) => {
  const { postId } = req.params;
  const { body} = req.body;
  const user_id = req.user._id; 
  

  try {
    const newComment = {
      body,
      post_id: postId,
      user_id,
      created_at: new Date(),
      likes: 0
    };
    const savedComment = await comment.create(newComment);

    const thisPost = await post.findByIdAndUpdate(
        postId,
        { $inc: { comment_count: 1 } },
        { new: true }
    );

    res.status(201).json({ comment: newComment});
  } catch (err) {
    console.error("Error saving comment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/:postId/like', routeAuthentication, async (req, res) => {
  try {
    console.log("Liking post with ID:", req.params.postId);
    const userId = req.user._id;
    console.log("User ID:", userId);
    const tenant = await tenantSchema.findOne({ user_id: userId });
    console.log("Tenant found:", tenant);
    if (!tenant) return res.status(403).json({ message: 'Only tenants can like posts.' });

    const postId = req.params.postId;

    const thisPost = await post.findById({_id:postId});
    console.log('Post found:', thisPost);
    if (!thisPost) return res.status(404).json({ message: 'Post not found' });
    const hasLiked = tenant.liked_posts.includes(postId);
    if (hasLiked) {
      // UNLIKE
      tenant.liked_posts.pull(postId);
      thisPost.likes = Math.max(0, thisPost.likes - 1);
    } else {
      // LIKE
      tenant.liked_posts.addToSet(postId);
      thisPost.likes += 1;
    }

    await tenant.save();
    await thisPost.save();

    res.json({
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likes: thisPost.likes,
      liked_by_user: !hasLiked
    });

  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error liking post' });
  }
});

module.exports = router;