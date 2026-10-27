import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar, FaChevronLeft, FaChevronRight, FaTimes, FaCheck } from 'react-icons/fa';
import { MdOutlineClose } from "react-icons/md";
import ConnectButton from './ConnectButton';
import axios from 'axios'; 
import "./ListingDetailPage.css"
import { initialProperties as properties, reviews } from './listingData';

const AccordionSection = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="accordion-section">
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <span>{title}</span>
                <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

const StarRating = ({ rating, layout = 'horizontal' }) => {
    const totalStars = 5;
    const [filledStars, setFilledStars] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilledStars(rating);
        }, 100);
        return () => clearTimeout(timer);
    }, [rating]);

    return (
        <div className={`star-rating ${layout}`}>
            {[...Array(totalStars)].map((_, index) => (
                <FaStar key={index} className={index < filledStars ? 'star filled' : 'star'} />
            ))}
        </div>
    );
};

function ListingDetailPage() {
    const { id } = useParams();
   const [property, setProperty] = useState({
   amenities: {},
   landlord_requirements: {},
   images: [],
   });
    const [propertyReviews, setPropertyReviews] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

   // useEffect(() => {
   //     if (!id) return; 
   // const fetchProperty = async () => {
   //    try {
   //       console.log("callingapi")
   //       const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
   //       setProperty(res.data);
   //       console.log(res);
   //    } catch (err) {
   //       console.error('Error:', err);
   //    }
   // };
   // fetchProperty();
   // }, [id]);

useEffect(() => {
   if(!id)return;
   const fetchPropertyAndReviews = async () => {
      try {
         const res = await axios.get(`http://localhost:5000/api/listings/${id}`);
         setProperty(res.data);

         const reviewsRes = await axios.get(`http://localhost:5000/api/listings/ratings/${id}`);
         setPropertyReviews(reviewsRes.data);
         
      } catch (err) {
         console.error('Error:', err);
      }
   };

   fetchPropertyAndReviews();
}, [id]);
    if (!property) {
        return <div>Loading or Property Not Found...</div>;
    }

    const handleNextImage = () => setActiveImageIndex((prev) => (prev + 1) % property.images.length);
    const handlePrevImage = () => setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);

const allAmenities = {
    'AC': property?.ac,
    'Wi-Fi': property?.wifi,
    'Lift': property.amenities?.lift,
    'Water Purifier': property.amenities?.water_purifier,
    'Stove': property.amenities?.stove,
    'Power Backup': property.amenities?.inverter,
    'Fridge': property.amenities?.fridge,
    'Washing Machine': property.amenities?.washing_machine,
    'Mess (Veg)': property?.mess_included_veg,
    'Mess (Non-Veg)': property?.mess_included_nonveg,
};
    return (
        <div className="listing-detail-page">
            <div className="main-content">
                <div className="image-gallery">
                    <button className="save-button" onClick={() => setIsSaved(!isSaved)}>
                        {isSaved ? <FaHeart color="#e53e3e" /> : <FaRegHeart />}
                    </button>
                    <div className="main-image-container">
                        <button className="nav-arrow prev" onClick={handlePrevImage}><FaChevronLeft /></button>
                        <img src={property.images[activeImageIndex]} alt="Main property view" className="main-image" onClick={() => setIsLightboxOpen(true)} />
                        <button className="nav-arrow next" onClick={handleNextImage}><FaChevronRight /></button>
                    </div>
                    <div className="thumbnail-strip">
                        {property.images.map((img, index) => (
                            <img key={index} src={img} alt={`Thumbnail ${index + 1}`} className={index === activeImageIndex ? 'thumbnail active' : 'thumbnail'} onClick={() => setActiveImageIndex(index)} />
                        ))}
                        
                    </div>
                </div>

                <div className="property-info-container">
                    <div className="title-section">
                        <h1>{property.title}</h1>
                        <Link to={`/profile/${property.landlord_id}`} className="landlord-link">
                            by {property.landlord_name}
                        </Link>
                    </div>
                    <div className="tags-section">
                        <span className="property-tag">{property.category}</span>
                        <span className="property-tag">{property.lease_type}</span>
                        {property.verified && <span className="property-tag verified">✓ Verified</span>}
                    </div>
                    
                    {property?.price?.toLocaleString?.() || "Loading..."}
                    <p className="posted-date">Posted {Math.round((new Date() - new Date(property.last_updated)) / (1000 * 60 * 60 * 24))} days ago</p>
                     {/* <Link to={`/messages`} className="messages">
                        <button className="connect-button">
                           Connect
                        </button>
                     </Link> */}
                   <ConnectButton className="connect-button" listing={property} />
                    <AccordionSection title="Details" initiallyOpen={true}>
                        <ul className="details-list">
                            <li><strong>BHK:</strong> {property.bhk}</li>
                            <li><strong>Bathrooms:</strong> {property.bathrooms}</li>
                            <li><strong>Sharing:</strong> {property.sharing > 1 ? `${property.sharing}-sharing` : 'Single Occupancy'}</li>
                            <li><strong>Furnishing:</strong> {property.furnishing}</li>
                            <li><strong>Preferred Gender:</strong> {property.gender}</li>
                            <li><strong>Available:</strong> {property.availability_status ? 'Yes' : 'No'}</li>
                        </ul>
                    </AccordionSection>

                    <AccordionSection title="Amenities">
                        <ul className="amenities-list">
                            {Object.entries(allAmenities).map(([key, value]) => (
                                <li key={key} className={!value ? 'unavailable' : ''}>
                                    {value ? <FaCheck className="tick-icon" /> : <FaTimes className="cross-icon" />} {key}
                                </li>
                            ))}
                        </ul>
                    </AccordionSection>

                     <AccordionSection title="Landlord Requirements">
                     <ul className="details-list">
                        <li><strong>Drinking:</strong> {property.landlord_requirements?.drink ? 'Allowed' : 'Not Allowed'}</li>
                        <li><strong>Smoking:</strong> {property.landlord_requirements?.smoke ? 'Allowed' : 'Not Allowed'}</li>
                        <li><strong>Food:</strong> {property.landlord_requirements?.food_type || 'Not specified'}</li>
                     </ul>
                     </AccordionSection>
                </div>
            </div>

            

            <div className="reviews-section">
                <h2>Latest Reviews</h2>
                <div className="reviews-grid">
                    {propertyReviews.map(review => (
                        <div key={review.review_id} className="review-card">
                            <div className="review-rating">
                                <StarRating rating={review.rating} layout="vertical" />
                            </div>
                            <div className="review-content">
                                <h3>{review.review_title}</h3>
                                <p>{review.comment}</p>
                            </div>
                            <div className="reviewer-info">
                                <div className="reviewer-details">
                                    <strong>{review.reviewer_id.name}</strong>
                                    <span>{new Date(review.created_date).toLocaleDateString()}</span>
                                </div>
                                <img src={review.reviewer_id.profile_url} alt={review.reviewer_name} />
                            </div>
                        </div>
                    ))}
             </div>

             {/* this is naya */}
             <div className="add-review-container" style={{ paddingTop: '1.5rem' }}>
                
                <Link to={`/listing/${property._id}/writereview`} >
                <button className="add-review-btn">
                   
                      Write a Review
                      </button>
                    </Link>
                </div>
            
          </div>
          

            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <img src={property.images[activeImageIndex]} alt="Lightbox view" className="lightbox-image" />
                    <button className="lightbox-close"><MdOutlineClose /></button>
                </div>
            )}
        </div>
    );
}

export default ListingDetailPage;
