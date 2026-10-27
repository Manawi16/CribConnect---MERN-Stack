import React from 'react';
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { Link } from 'react-router-dom';

function PropertyCard({ property, onHover, onLeave}) { 
  // remove param onViewMapClick 
  //removed ab
  // const handleViewMapClick = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   onViewMapClick();
  // };

  return (
    <Link to={`/listing/${property._id}`} className="property-list-card-link">
      <div
        className="property-list-card"
        onMouseEnter={onHover} 
        onMouseLeave={onLeave}
      >
        <img src={property.images[0]} alt={property.title} className="card-image" />
        <div className="card-details">
          <div className="card-details-top">
            {property.verified && <span className="verified-badge-list"><AiOutlineSafetyCertificate /></span>}
            <h3 className="card-title">{property.title}</h3>
            <p className="card-location">{property.address.city}</p>
            <p className="card-info">{property.bhk} BHK • {property.furnishing.charAt(0).toUpperCase() + property.furnishing.slice(1)}</p>
          </div>
          <div className="card-footer-actions">
            <p className="card-price">₹{property.price.toLocaleString()}/month</p>
            {/* this button is updated */}
            <button className="btn-view-map">
                View Listing
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;