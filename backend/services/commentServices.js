const comment = require('..models/comment');
const User = require('../models/user');
const mongoose = require('mongoose');

//create, date auto done in schema
async function createComment({ post_id, user_id, body, parent_comment_id = null }) {
   const comment = new comment({
      post_id: new mongoose.Types.ObjectId(post_id),
      user_id: new mongoose.Types.ObjectId(user_id),
      body,
      parent_comment_id
   });
   return await comment.save();
};

//update
async function updateComment(comment_id, updateData) {
   updateData.edited_at = new Date();
   return await comment.findByIdAndUpdate(comment_id, updateData, { new: true });
};

//del
async function deleteComment(comment_id) {
   return await comment.findByIdAndDelete(comment_id);
};


//read
async function readComment(data) {
   try {
      let comments = [];
      if (data.comment_id) {
         const comment = await Comment.findById(data.comment_id);
         if (comment) {
            comments.push(comment);
         }
      }
      else if (data.postId) {
         comments = await Comment.find({ postId: new mongoose.Types.ObjectId(data.postId) })
                                 .sort({ created_date: 1 })
      }
      else {
         console.log("No comment_id or postId provided for reading comments.");
         //think console should tell me if mess up happens?
         return [];
      }

      if (comments.length === 0) {
         return [];
      }
      const userIds = [...new Set(comments.map(comment => comment.userId.toString()))];
      const users = await User.find({ _id: { $in: userIds } })
                              .select('_id name profile')
      const userMap = new Map();
      users.forEach(user => {
         userMap.set(user._id.toString(), user);
      });

      // get user details into the comments
      const commentsWithUserDetails = comments.map(comment => {
         const userDetails = userMap.get(comment.userId.toString());
         return {
         ...comment,
         userId: userDetails ? {
            _id: userDetails._id,
            name: userDetails.name,
            profile: userDetails.profile
         } : comment.userId
         };
         //i'm confused but it works- so ig-
      });

      console.log(`Found ${commentsWithUserDetails.length} comments.`);
      return commentsWithUserDetails;
   }
   catch (error) {
      console.error("Error reading comment(s):", error);
      throw error;
   }
}

module.exports = {
   createComment,
   updateComment,
   readComment,
   deleteComment
};