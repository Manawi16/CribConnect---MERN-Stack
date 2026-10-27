import React, { useState } from "react";
import "./form.css"; // style below

function ProfileForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    email: "",
    education: "",
    country: "",
    state: "",
    experience: "",
    details: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted form:", formData);
    // Replace with actual POST to backend
  };

  return (
    <div className="profile-form-wrapper">
      <form className="profile-form" onSubmit={handleSubmit}>
        <h2>Profile Settings</h2>

        <div className="form-row">
          <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} />
          <input type="text" name="lastName" placeholder="Surname" value={formData.lastName} onChange={handleChange} />
        </div>

        <input type="text" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} />
        <input type="text" name="address" placeholder="Enter address" value={formData.address} onChange={handleChange} />
        <input type="email" name="email" placeholder="Enter email ID" value={formData.email} onChange={handleChange} />
        <input type="text" name="education" placeholder="Education" value={formData.education} onChange={handleChange} />

        <div className="form-row">
          <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
          <input type="text" name="state" placeholder="State/Region" value={formData.state} onChange={handleChange} />
        </div>

        <button type="submit">Save Profile</button>
      </form>


    </div>
  );
}

export default ProfileForm;
