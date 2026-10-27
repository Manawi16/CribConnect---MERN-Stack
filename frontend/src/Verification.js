// src/Verification.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Verification.css';
import axios from 'axios';
import { useModal } from './ModalContext'; // Import the modal hook

function Verification() {
  const navigate = useNavigate();
  const { showModal } = useModal(); // Use the modal hook
  const [formData, setFormData] = useState({
    fullName: '',
    panNumber: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!formData.panNumber.trim()) {
      newErrors.panNumber = 'PAN number is required.';
    } else if (!panRegex.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Please enter a valid PAN number format.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentChecked) {
      showModal({ message: "Please check the consent box to proceed. We cannot verify you without your consent." });
      return;
    }

    if (validate()) {
      try {
        const res = await axios.post('http://localhost:5000/api/verify-pan', {
          fullName: formData.fullName,
          panNumber: formData.panNumber.toUpperCase(),
        });

        console.log("PAN Verified:", res.data);
        showModal({
          message: "Verification successful!",
          onConfirm: () => navigate('/dashboard')
        });
      } catch (err) {
        console.error("PAN Verification Error:", err.response?.data || err.message);
        showModal({ message: "PAN verification failed. Please check the details and try again." });
      }
    }
  };

  return (
    <div className="verification-page">
      <form className="verification-form" onSubmit={handleSubmit} noValidate>
        <div className="verification-header">
          <h1>Verification</h1>
          <p>Please provide your details per your government ID to get a 'Verified' badge.</p>
        </div>

        <div className="form-group">
          <label htmlFor="fullName">Full Name*</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            placeholder="Enter your full name" 
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="panNumber">PAN Number*</label>
          <input 
            type="text" 
            id="panNumber" 
            name="panNumber" 
            value={formData.panNumber} 
            onChange={handleChange} 
            placeholder="e.g., ABCDE1234F" 
            maxLength="10"
          />
          {errors.panNumber && <span className="error-message">{errors.panNumber}</span>}
        </div>

        <div className="form-group consent-group">
            <label>
               <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consentChecked} 
                  onChange={(e) => setConsentChecked(e.target.checked)}
               ></input>
                 <p>I authorize Crib Connect to use my government ID for the sole purpose of user verification.</p>
              </label>
            <label>
               <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consentChecked} 
                  onChange={(e) => setConsentChecked(e.target.checked)}
               ></input>  
                 <p>I hereby declare that the information provided is true and correct to the best of my knowledge.</p>
            </label>
           </div>

        <button type="submit" className="submit-btn">Submit for Verification</button>
      </form>
    </div>
  );
}

export default Verification;