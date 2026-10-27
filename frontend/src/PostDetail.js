import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaRegHeart, FaHeart, FaShareAlt } from 'react-icons/fa';
import './Community.css';
import axios from 'axios';

// newwww
const CommentItem = ({ comment, onLike, isLiked }) => {
  const getFinalProfilePic = (pic) => {
  // Case 1: If it's a Googleusercontent link → Blocked? Use placeholder
  if (pic?.includes("googleusercontent")) {
    return "https://picsum.photos/400/300?random=22";
  }

  // Case 2: If it's stored in backend uploads folder
  if (pic && !pic.startsWith("http")) {
    return `http://localhost:5000${pic}`; // change base URL if needed
  }

  // Default (valid external URL)
  return pic || "https://picsum.photos/400/300?random=22";
};

  return (
    <div className="comment-item">
      {console.log("PRo",comment._id,comment.profilePic)}
      {comment.profilePic ? (
        <img
          src={getFinalProfilePic(comment.profilePic)}
          alt="User"
          className="comment-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://picsum.photos/400/300?random=22";
          }}
        />
      ) : (
        <FaUserCircle size={32} className="comment-avatar" />
      )}
      <div className="comment-content">
        <div className="comment-header">
          <strong>{comment.author}</strong>
          <span className="comment-timestamp">{formatTimeAgo(comment.timestamp)}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
        <div className="comment-actions">
          <button onClick={onLike} className="comment-like-btn">
            {isLiked ? <FaHeart className="liked-icon" /> : <FaRegHeart />}
            <span>{comment.likes > 0 ? comment.likes : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
// newwww

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

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [commentSort, setCommentSort] = useState('default');
  const [isPostLiked, setIsPostLiked] = useState(false);
  // newwww
  const [likedComments, setLikedComments] = useState(new Set());
  // newwww
  const [currentUserId, setCurrentUserId] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", { withCredentials: true });
        setCurrentUserId(res.data._id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    console.log("Fetched currentUserId:", currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/post/${id}`);
        const { postResult, comments } = response.data;

        const formattedComments = comments.map(comment => {
          const isCurrentUser = comment.user_id?._id === currentUserId;
          console.log('Profile URL:', comment.user_id?.profile_url);
          // newwww
          return {
            _id: comment._id,
            author: isCurrentUser ? "You" : comment.user_id?.name || "Anonymous",
            profilePic: comment.user_id?.profile_url || 'https://picsum.photos/400/300?random=10',
            text: comment.body,
            timestamp: comment.created_at,
            likes: comment.likes || 0
          };
          // newwww
        });

        const liked_by_user = response.data.liked_by_user;

        setIsPostLiked(liked_by_user);
        setPost({ ...postResult, comments: formattedComments, comment_count: formattedComments.length });

      } catch (error) {
        console.error("Failed to fetch post:", error);
      }
    };

    fetchPost();
  }, [id, currentUserId]);

  const sortedComments = useMemo(() => {
    if (!post || !post.comments) return [];
    const commentsCopy = [...post.comments];
    if (commentSort === 'recent') return commentsCopy.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (commentSort === 'popular') return commentsCopy.sort((a, b) => b.likes - a.likes);
    return commentsCopy;
  }, [post, commentSort]);

  const handleLikePost = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/post/${id}/like`,
        {},
        { withCredentials: true }
      );

      const { likes, liked_by_user } = response.data;
      setPost(prev => ({ ...prev, likes }));
      setIsPostLiked(liked_by_user);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // newwww
  const handleCommentLike = (commentId) => {
    setPost(prevPost => {
      const newLikedComments = new Set(likedComments);
      const isLiked = newLikedComments.has(commentId);
      const updatedComments = prevPost.comments.map(comment => {
        if (comment._id === commentId) {
          const newLikes = isLiked ? comment.likes - 1 : comment.likes + 1;
          if (isLiked) {
            newLikedComments.delete(commentId);
          } else {
            newLikedComments.add(commentId);
          }
          return { ...comment, likes: newLikes };
        }
        return comment;
      });
      setLikedComments(newLikedComments);
      return { ...prevPost, comments: updatedComments };
    });
  };
  // newwww

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (newComment.trim() && post) {
      try {
        const response = await axios.post(`http://localhost:5000/api/post/${id}/addcomment`, {
          body: newComment,
          withCredentials: true
        });

        // newwww
        const newSavedComment = {
          _id: response.data.comment._id,
          author: "You",
          text: response.data.comment.body,
          timestamp: response.data.comment.created_at,
          likes: 0
        };
        // newwww

        setPost(prevPost => ({
          ...prevPost,
          comments: [...prevPost.comments, newSavedComment],
          comment_count: prevPost.comment_count + 1
        }));

        setNewComment("");
      } catch (error) {
        console.error("Failed to post comment:", error);
        alert("Error posting comment. Try again.");
      }
    }
  };

  if (!post) return <div className="loading-view">Loading...</div>;

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back to Community</button>
        <div className="post-content">
          <div className="post-header">
            <span className="info-icon"><FaUserCircle /></span>
            <h1>{post.title}</h1>
          </div>
          <p className="post-body">{post.body}</p>

          {post.images.map((img, index) => {
              const isAbsoluteUrl = img.startsWith('http://') || img.startsWith('https://');
              const imageUrl = isAbsoluteUrl ? img : `http://localhost:5000${img}`;
              console.log(imageUrl)
              return (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Post content ${index + 1}`}
                  className="post-image"
                />
              );
            })}
          <div className="post-actions">
            <button onClick={handleLikePost} className="action-button">
              {isPostLiked ? <FaHeart className="liked-icon" /> : <FaRegHeart />}
              <span>{post?.likes || 0}</span>
            </button>
            <button className="action-button">
              <FaShareAlt />
              <span>Share</span>
            </button>
          </div>

          <div className="comments-section">
            <div className="comments-header">
              <h4>Comments ({post.comment_count})</h4>
              <div className="comment-sort-filters">
                <button className={commentSort === 'default' ? 'active' : ''} onClick={() => setCommentSort('default')}>Default</button>
                <button className={commentSort === 'recent' ? 'active' : ''} onClick={() => setCommentSort('recent')}>Most Recent</button>
                <button className={commentSort === 'popular' ? 'active' : ''} onClick={() => setCommentSort('popular')}>Most Popular</button>
              </div>
            </div>
            <div className="comments-list">
              {/* newwww */}
              {sortedComments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onLike={() => handleCommentLike(comment._id)}
                  isLiked={likedComments.has(comment._id)}
                />
              ))}
              {/* newwww */}
            </div>
            <form onSubmit={handleSubmitComment} className="comment-form">
              <input type="text" className="comment-input" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <button type="submit" className="comment-submit-button">Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


// function PostDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [post, setPost] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const foundPost = allPosts.find(p => p.id === id);
//     setPost(foundPost);
//     setIsLoading(false);
//   }, [id]);

//   const handleAddComment = (postId, commentText) => {
//     const newComment = { 
//       author: "You", 
//       text: commentText, 
//       timestamp: new Date().toISOString(), 
//       likes: 0 
//     };
//     setPost(prevPost => ({
//       ...prevPost,
//       comments: [...prevPost.comments, newComment]
//     }));
//   };
  
//   if (isLoading) return <div>Loading...</div>;
//   if (!post) return <div style={{ padding: '2rem' }}>Post not found.</div>;

//   return (
//     <div className="post-detail-page">
//       <div className="post-detail-container">
//         <button className="back-btn" onClick={() => navigate(-1)}>← Back to Community</button>
//         <PostView post={post} onAddComment={handleAddComment} />
//       </div>
//     </div>
//   );
// }

export default PostDetail;