// src/ContactUs.js
import React, { useState } from 'react';
import './ContactUs.css';
import { useModal } from './ModalContext'; // Import the custom hook

function ContactUs() {
  const { showModal } = useModal(); // Use the hook to get the showModal function
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.message) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form submitted:', formData);
      // Trigger the global modal instead of the local popup state
      showModal({
        message: "We have received your message.\nWe will get back to you in 5-7 Business days",
        onConfirm: closePopup, // The closePopup function will run when "OK" is clicked
      });
    }
  };

  const closePopup = () => {
    setFormData({ name: '', surname: '', email: '', message: '' });
  };

  return (
    <div className="contact-us-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
      </div>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Name*</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Value" />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="surname">Surname</label>
          <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} placeholder="Value" />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Value" />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message*</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Value" rows="5"></textarea>
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default ContactUs;