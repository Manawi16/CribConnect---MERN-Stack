const Post = require('../models/post');
const User = require('../models/user');
const mongoose = require('mongoose');

// create
async function createPost({ user_id, title, body, images = [], my_post = false }) {
   const post = new Post({
      user_id,
      title,
      body,
      images,
      my_post
   });
   return await post.save();
}

// update
async function updatePost(post_id, updateData) {
   updateData.edited_at = new Date();
   return await Post.findByIdAndUpdate(post_id, updateData, { new: true });
}

// delete
async function deletePost(post_id) {
   return await Post.findByIdAndDelete(post_id);
}

// read
async function readPost(data) {
   try {
      let posts = [];

      if (data.post_id) {
         const post = await Post.findById(data.post_id);
         if (post) posts.push(post);
      }
      else if (data.user_id) {
         posts = await Post.find({ user_id: new mongoose.Types.ObjectId(data.user_id) })
                           .sort({ created_at: -1 })
      }
      else {
         console.log("No post_id or user_id provided for reading posts.");
         return [];
      }

      if (posts.length === 0) return [];

      const userIds = [...new Set(posts.map(p => p.user_id.toString()))];
      const users = await User.find({ _id: { $in: userIds } })
                              .select('_id name profile_picture_url')

      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      const postsWithUser = posts.map(post => {
         const user = userMap.get(post.user_id.toString());
         return {
            ...post,
            user_id: user ? {
               _id: user._id,
               name: user.name,
               profile_picture_url: user.profile_picture_url
            } : post.user_id
         };
      });

      console.log(`Found ${postsWithUser.length} post(s).`);
      return postsWithUser;

   }
   catch (error) {
      console.error("Error reading post(s):", error);
      throw error;
   }
}

module.exports = {
   createPost,
   updatePost,
   readPost,
   deletePost
};
