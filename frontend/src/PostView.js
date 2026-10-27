import React, { useState, useMemo } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import './Community.css';

function PostView({ post, onAddComment }) {
  const [newComment, setNewComment] = useState("");
  const [commentSort, setCommentSort] = useState('default');

  const sortedComments = useMemo(() => {
    if (!post || !post.comments) return [];
    const commentsCopy = [...post.comments];
    if (commentSort === 'recent') {
      return commentsCopy.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    if (commentSort === 'popular') {
      return commentsCopy.sort((a, b) => b.likes - a.likes);
    }
    return commentsCopy;
  }, [post.comments, commentSort]);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(post.id, newComment);
      setNewComment("");
    }
  };

  return (
    <div className="post-content">
        <div className="post-header">
            <span className="info-icon"><FaUserCircle size={32}/></span>
            <h1>{post.title}</h1>
        </div>
        <p className="post-body">{post.body}</p>
        <div className="comments-section">
            <div className="comments-header">
                <h4>Comments ({post.comments.length})</h4>
                <div className="comment-sort-filters">
                    <button className={commentSort === 'default' ? 'active' : ''} onClick={() => setCommentSort('default')}>Default</button>
                    <button className={commentSort === 'recent' ? 'active' : ''} onClick={() => setCommentSort('recent')}>Most Recent</button>
                    <button className={commentSort === 'popular' ? 'active' : ''} onClick={() => setCommentSort('popular')}>Most Popular</button>
                </div>
            </div>
            <div className="comments-list">
                {sortedComments.map((comment, index) => (
                <div key={index} className="comment">
                    <strong>{comment.author}</strong>: {comment.text}
                </div>
                ))}
            </div>
            <form onSubmit={handleSubmitComment} className="comment-form">
                <input 
                    type="text" 
                    className="comment-input" 
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="comment-submit-button">Post</button>
            </form>
        </div>
    </div>
  );
}

export default PostView;