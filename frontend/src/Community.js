import React, { useState, useMemo,useEffect } from 'react';
import { Link } from 'react-router-dom';
import InfoCard from './InfoCard';
import axios from 'axios'; 
import './Community.css';
import PostView from './PostView';
import { FaPlus } from 'react-icons/fa';

function Community() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  // const currentUser = { id: "user_abc123" }; 
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
  },[]);


  useEffect(() => {
  const fetchPosts = async () => {
    try {
  const res = await axios.get('http://localhost:5000/api/community-posts', {
    withCredentials: true
  });
console.log("Fetched posts:", res.data);
console.log("id",res.data.id)
 // Debugging line to check fetched data
       // replace with your real endpoint
      setPosts(res.data); // assuming backend sends array of posts
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  fetchPosts();
}, []);
  const handleAddComment = (postId, commentText) => {
    const newComment = { author: "You", text: commentText, timestamp: new Date().toISOString(), likes: 0 };
    const updatedPosts = posts.map(post => {
      if (post._id === postId) {
        const updatedComments = [...post.comments, newComment];
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);
    setSelectedPost(prevPost => ({
      ...prevPost,
      comments: [...prevPost.comments, newComment]
    }));
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
  };

  const filteredPosts = posts.filter(post => !activeFilter || post.category === activeFilter);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="community">
      <div className="community-container">
        <div className="community-header">
          <h1>Community</h1>
          <p>Desi Solutions for Desi Needs - Connect with Peers</p>
        </div>
        
        <div className="filters">
          <button 
            className={activeFilter === 'Roommate' ? 'filter-tag active' : 'filter-tag'}
            onClick={() => setActiveFilter(activeFilter === 'Roommate' ? null : 'Roommate')}
          >
            Roommate Listings
          </button>
          <Link to={`/user/${currentUserId}/createpost`} className="create-post-btn">
            <FaPlus /> Create Post
          </Link>
        </div>

        <main className="card-grid">
          {currentPosts.map(post => (
            <InfoCard
              key={post._id} 
              post={post}
              onViewPost={() => handleViewPost(post)}
            />
          ))}
        </main>

        {totalPages > 1 && (
          <nav className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="page-link"
            >
              ← Previous
            </button>
            {[...Array(totalPages).keys()].map(number => (
              <button 
                key={number + 1} 
                onClick={() => handlePageChange(number + 1)}
                className={currentPage === number + 1 ? 'page-link active' : 'page-link'}
              >
                {number + 1}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="page-link"
            >
              Next →
            </button>
          </nav>
        )}

       {selectedPost && (
          <PostView
            post={selectedPost} 
            currentUserId={currentUserId}
            onClose={() => setSelectedPost(null)}
            onAddComment={handleAddComment}
          />
        )}


    </div>  
    </div>
  );
}

export default Community;