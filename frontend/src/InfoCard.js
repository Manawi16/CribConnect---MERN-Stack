import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaRegHeart, FaHeart, FaRegComment, FaShareAlt, FaTimes } from 'react-icons/fa';
import './Community.css';

function CopiedPopup({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="action-popup">
      <span>{message}</span>
      <button onClick={onClose} className="popup-close-btn"><FaTimes /></button>
    </div>
  );
}

function formatTimeAgo(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const seconds = Math.floor((now - postDate) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

function InfoCard({ post, onAddComment, onViewPost }) {
  const [isLiked, setIsLiked] = useState(post.liked_by_user || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);

  useEffect(() => {
  const fetchLikeStatus = async () => {
    const res = await axios.get(`http://localhost:5000/api/post/${post._id}`, {
      withCredentials: true
    });
    setIsLiked(res.data.liked_by_user);
  };

  fetchLikeStatus();
  }, [post._id]);

  useEffect(() => {
  setIsLiked(post.liked_by_user || false);
  setLikeCount(post.likes || 0);
}, [post.liked_by_user, post.likes]);

const handleLikeClick = async () => {
  if (!post || !post._id || post._id === 'undefined') {
    console.warn("Invalid post object in like handler:", post);
    return;
  }
  try {
    const res = await axios.post(`http://localhost:5000/api/post/${post._id}/like`,{
  withCredentials: true 
});
    console.log("Like response:", res.data);

    setIsLiked(res.data.liked_by_user);
    setLikeCount(res.data.likes);

  } catch (err) {
    console.error("Like update failed:", err);
  }
};


const handleShareClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const postUrl = `${window.location.origin}/community/post/${post._id}`;
  navigator.clipboard.writeText(postUrl).then(() => {
    setShowCopiedPopup(true);
  });
};

  // const handleCommentSubmit = (e) => {
  //   e.preventDefault();
  //   if (newComment.trim() === "") return;
  //   onAddComment(post._id, newComment);
  //   setNewComment("");
  // };

  return (
    <>
      <div className="info-card">
        <div className="card-header">
          <a href={post.userProfileUrl} className="icon-link">
            <FaUserCircle size={28} />
          </a>
          <div className="header-text">
            <h3>{post.title}</h3>
            <span className="time-ago">{formatTimeAgo(post.date)}</span>
          </div>
        </div>
        <p className="card-body">{post.body}</p>
        <div className="card-footer">
          <Link to={`/community/post/${post._id}`} className="card-button" style={{textDecoration: 'none'}}>
            View Post
          </Link>
          <div className="card-actions">
            <button onClick={handleLikeClick} className="icon-link" aria-label="Like post">
              {isLiked ? <FaHeart size={22} className="liked-icon" /> : <FaRegHeart size={22} />}
              <span className="action-count">{likeCount}</span>
            </button>
            <Link to={`/community/post/${post._id}`} className="icon-link" aria-label="Comment on post">
              <span className="action-count">{post.comment_count}</span>
              <FaRegComment size={22} />
          </Link>
            <button onClick={handleShareClick} className="icon-link" aria-label="Share post">
              <FaShareAlt size={22} />
            </button>
          </div>
        </div>
        {/* {commentsVisible && (
          <div className="comments-section">
            {post.comments.length > 0 ? (
              post.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <strong>{comment.author}</strong>: {comment.text}
                </div>
              ))
            ) : (
              <div className="comment">No comments yet.</div>
            )}
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input type="text" className="comment-input" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." />
              <button type="submit" className="comment-submit-button">Post</button>
            </form>
          </div>
        )} */}
      </div>
      {showCopiedPopup && <CopiedPopup message="Link copied to clipboard!" onClose={() => setShowCopiedPopup(false)} />}
    </>
  );
}

export default InfoCard;