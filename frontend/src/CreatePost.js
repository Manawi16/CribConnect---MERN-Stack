// src/CreatePost.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CreatePost.css';
import axios from 'axios';
import { useModal } from './ModalContext'; // Import the modal hook

function CreatePost() {
  const navigate = useNavigate();
  const { showModal } = useModal(); // Use the modal hook
  const { userId } = useParams(); 
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isRoommatePost, setIsRoommatePost] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!body.trim()) newErrors.body = "Body text is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title);
    formData.append('body', body);
    formData.append('isRommatePost', isRoommatePost);
    if (image) {
      formData.append('images', image);
    }
    try {
      console.log("Submitting post with data:", { user_id: userId, title, body, image });
      const res = await axios.post('http://localhost:5000/api/community/add-posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      showModal({
        message: "Post submitted successfully!",
        onConfirm: () => navigate('/community')
      });
    } catch (error) {
      console.error("Post submission failed:", error);
      showModal({ message: "Failed to submit post. Please try again later." });
    }
  };

  return (
    <div className="create-post-page">
      <form onSubmit={handleSubmit} className="create-post-form" noValidate>
        <h1>Create a New Post</h1>
        
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input 
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title" 
          />
          {errors.title && <p className="error-message">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="body">Body*</label>
          <textarea 
            id="body" 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows="10"
            placeholder="Share your thoughts, ask a question, or find a roommate..."
          />
          {errors.body && <p className="error-message">{errors.body}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image (Optional)</label>
          <input 
            type="file" 
            id="image"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
            </div>
          )}
        </div>

        <div className="form-group roommate-toggle">
          <label htmlFor="isRoommatePost">
            <input 
              className='check'
              type='checkbox' 
              id="isRoommatePost"
              checked={isRoommatePost}
              onChange={(e) => setIsRoommatePost(e.target.checked)}
            />
            This post is a roommate request.
          </label>
        </div>

        <button type="submit" className="submit-post-btn">Publish Post</button>
      </form>
    </div>
  );
}

export default CreatePost;