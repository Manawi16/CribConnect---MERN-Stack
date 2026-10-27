import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaUpload } from 'react-icons/fa';
import './Review.css'; // Using a renamed version of your provided CSS

function WriteReview() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);

      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previewsArray]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    
    const reviewData = {
      reviewer_id: 'current_user_id_123', // This would come from your auth context
      property_id: propertyId,
      rating: rating,
      comment: comment,
      image_attachment: images.map(file => file.name), // In a real app, you'd upload and get URLs
    };

    console.log("Submitting Review:", reviewData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="review-page">
        <div className="review-form success-message">
          <h2>Thank You!</h2>
          <p>Your review has been submitted and is pending approval.</p>
          <button onClick={() => navigate(-1)} className="submit-btn">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page">
      <form className="review-form" onSubmit={handleSubmit} noValidate>
        <div className="review-header">
          <h1>Write a Review</h1>
          <p>Share your experience to help others in the community.</p>
        </div>

        <div className="form-group">
          <label>Your Rating*</label>
          <div className="star-rating-input">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <FaStar
                  key={ratingValue}
                  className="star"
                  color={(hoverRating || rating) >= ratingValue ? "#ffc107" : "#e4e5e9"}
                  size={30}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHoverRating(ratingValue)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              );
            })}
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="comment">Your Review</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="6"
            placeholder="Describe your experience, the property, and the landlord..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="image_attachment">Add Photos (Optional)</label>
          <label htmlFor="image-upload" className="file-upload-label">
            <FaUpload /> Choose Images
          </label>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
          />
          <div className="image-previews">
            {imagePreviews.map((src, i) => <img key={i} src={src} alt="Upload preview" />)}
          </div>
        </div>

        <button type="submit" className="submit-btn">Submit Review</button>
      </form>
    </div>
  );
}

export default WriteReview;
