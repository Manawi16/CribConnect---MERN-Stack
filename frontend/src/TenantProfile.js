import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios'; 

// const dummyTenantData = {
//   account_id: "acc_12345",
//   full_name: "Rohan Mehra",
//   age_range: "18-24",
//   gender: "male",
//   occupation_status: "student",
//   eating_habits: "non-veg",
//   smoke: false,
//   drink: true,
//   profile_picture: "https://picsum.photos/200",
//   address: {
//     city: "New Delhi",
//     state: "Delhi",
//   },
// };


function TenantProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  // useEffect(() => {
  //     setTimeout(() => {
  //     setProfile(dummyTenantData);
  //     setIsLoading(false);
  //   }, 500);
  // }, []);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      console.log("fetch api",currentUserId)
      const res = await axios.get(`http://localhost:5000/api/tenant/profile/${currentUserId}`);
      setProfile(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };
  fetchProfile();
}, [currentUserId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

const handleSave = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.put(
      `http://localhost:5000/api/tenant/profile/${currentUserId}`, // assuming RESTful
      profile
    );
    console.log("Profile updated:", response.data);
    setIsEditing(false);
  } catch (err) {
    console.error("Failed to update profile", err);
  }
};


  if (isLoading) {
    return <div className="loading-pane">Loading Profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="edit-profile-btn">Edit Profile</button>
        )}
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-picture-section">
          <div className="pfp-container">
            <img src={profile.profile_picture ||"https://picsum.photos/400/300?random=2"} alt="Profile" className="pfp-image" />
            {isEditing && (
              <label htmlFor="pfp-upload" className="pfp-upload-label">
                <FaCamera />
                <input id="pfp-upload" type="file" />
              </label>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input type="text" id="full_name" name="full_name" value={profile.full_name || ''} onChange={handleInputChange} disabled={!isEditing} />
          </div>

          <div className="form-group">
            <label htmlFor="age_range">Age Range</label>
            <select id="age_range" name="age_range" value={profile.age_range || ''} onChange={handleInputChange} disabled={!isEditing}>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45+">45+</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select id="gender" name="gender" value={profile.gender || ''} onChange={handleInputChange} disabled={!isEditing}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="occupation_status">Occupation</label>
            <select id="occupation_status" name="occupation_status" value={profile.occupation_status || ''} onChange={handleInputChange} disabled={!isEditing}>
              <option value="student">Student</option>
              <option value="working">Working</option>
              <option value="professional">Professional</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="address.city">City</label>
            <input type="text" id="address.city" name="address.city" value={profile.address?.city || ''} onChange={handleInputChange} disabled={!isEditing} />
          </div>

          <div className="form-group">
            <label htmlFor="address.state">State</label>
            <input type="text" id="address.state" name="address.state" value={profile.address?.state || ''} onChange={handleInputChange} disabled={!isEditing} />
          </div>
        </div>

        <div className="preferences-section">
          <h4>Preferences</h4>
          <div className="checkbox-group">
            <label><input type="checkbox" name="smoke" checked={profile.smoke || false} onChange={handleInputChange} disabled={!isEditing} /> Smoke</label>
            <label><input type="checkbox" name="drink" checked={profile.drink || false} onChange={handleInputChange} disabled={!isEditing} /> Drink</label>
          </div>
          <div className="form-group">
            <label htmlFor="eating_habits">Eating Habits</label>
            <select id="eating_habits" name="eating_habits" value={profile.eating_habits || ''} onChange={handleInputChange} disabled={!isEditing}>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            <button type="submit" className="save-btn">Save Changes</button>
          </div>
        )}
      </form>
    </div>
  );
}

export default TenantProfile;