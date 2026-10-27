// BlogPage.js
import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import blogList from './blogs'; // The data is now self-contained here
import './Blog.css';

function BlogPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const blogId = searchParams.get("id");

  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;

  // --- BLOG READER VIEW LOGIC ---
  if (blogId) {
    const selectedBlog = blogList.find(blog => blog.id === blogId);

    if (!selectedBlog) {
      return (
        <div className="blog-reader">
          <button onClick={() => navigate(-1)} className="back-btn">← Back to Reads</button>
          <h1>Blog not found</h1>
          <p>Sorry, we couldn't find that blog post.</p>
        </div>
      );
    }

    return (
      <div className="blog-reader">
        <button onClick={() => navigate(-1)} className="back-btn">← Back to Reads</button>
        <h1 className="reader-title">{selectedBlog.title}</h1>
        <p className="reader-author">By <i>{selectedBlog.author}</i></p>
        <img src={selectedBlog.image} alt={selectedBlog.title} className="reader-image" />
        <div className="reader-body">
          {selectedBlog.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    );
  }

  // --- MAIN BLOG LIST VIEW LOGIC ---
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogList.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogList.length / blogsPerPage);

  return (
    <div className="blog-page">
      <h1>Crib Connect Reads</h1>
      <p className="subtitle">Insights and stories for the modern renter.</p>
      
      <div className="blog-grid">
        {currentBlogs.map((blog) => (
          <Link to={`/blog?id=${blog.id}`} key={blog.id} className="blog-card-link">
            <div className="blog-card">
              <img src={blog.image} alt={blog.title} />
              <div className="card-content">
                <h3>{blog.title}</h3>
                <p className="author">By {blog.author}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="paginationn">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="page-btn">← Previous</button>
          {[...Array(totalPages).keys()].map(number => (
            <button key={number + 1} onClick={() => setCurrentPage(number + 1)} className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}>
              {number + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="page-btn">Next →</button>
        </div>
      )}
    </div>
  );
}

export default BlogPage;