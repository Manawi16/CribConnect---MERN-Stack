import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './profile.css';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
// const dummyLandlordData = {
//   account_id: "acc_landlord_67890",
//   full_name: "Sunita Sharma",
//   contact_number: "9876543210",
// //   documents_uploaded: {
// //     property_tax_receipt: null,
// //     electricity_bill: null,
// //   },
//   profile_picture: "https://picsum.photos/200",
//   listings_posted: 5,
//   active: true,
// };

function LandlordProfile() {
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
  //   setTimeout(() => {
  //     setProfile(dummyLandlordData);
  //     setIsLoading(false);
  //   }, 500);
  // }, []);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/landlord/profile/acc_landlord_67890`);
      const data = await res.json();
      setProfile(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };
  fetchProfile();
}, [currentUserId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     if (files[0]) {
//       setProfile(prev => ({
//         ...prev,
//         documents_uploaded: {
//           ...prev.documents_uploaded,
//           [name]: files[0].name 
//         }
//       }));
//     }
//   };

  // const handleSave = (e) => {
  //   e.preventDefault();
  //   console.log("Saving landlord profile:", profile);
  //   setIsEditing(false);
  // };
const handleSave = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`http://localhost:5000/api/landlord/profile/${profile.account_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    });

    if (!res.ok) throw new Error("Failed to update profile");

    const updated = await res.json();
    setProfile(updated);
    setIsEditing(false);
    console.log("Profile updated:", updated);
  } catch (err) {
    console.error("Error updating profile", err);
  }
};

  if (isLoading) {
    return <div className="loading-pane">Loading Profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Landlord Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="edit-profile-btn">Edit Profile</button>
        )}
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-picture-section">
          <div className="pfp-container">
            <img src={profile.profile_picture} alt="Profile" className="pfp-image" />
            {isEditing && (
              <label htmlFor="pfp-upload" className="pfp-upload-label">
                <FaCamera />
                <input id="pfp-upload" type="file" name="profile_picture" />
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
            <label htmlFor="contact_number">Contact Number</label>
            <input type="tel" id="contact_number" name="contact_number" value={profile.contact_number || ''} onChange={handleInputChange} disabled={!isEditing} />
          </div>
        </div>

        <div className="preferences-section">
          <h4>Document Verification</h4>
          <p className="description">Upload documents to get a 'Verified' badge on your listings. This helps build trust with tenants.</p>
             <p className="verify">
              <Link to={"/verification"}>
                 <button
                  type="button" className="verify-redirect"> Verify Now </button>
                 </Link>
            </p>
              {/* <div className="form-grid"> */}
            {/* <div className="form-group">
              <label htmlFor="property_tax_receipt">Property Tax Receipt</label>
              {isEditing ? (
                <input type="file" id="property_tax_receipt" name="property_tax_receipt" onChange={handleFileChange} />
              ) : (
                <input type="text" value={profile.documents_uploaded?.property_tax_receipt || 'Not uploaded'} disabled />
              )}
            </div>
            <div className="form-group">
              <label htmlFor="electricity_bill">Latest Electricity Bill</label>
              {isEditing ? (
                <input type="file" id="electricity_bill" name="electricity_bill" onChange={handleFileChange} />
              ) : (
                <input type="text" value={profile.documents_uploaded?.electricity_bill || 'Not uploaded'} disabled />
              )}
            </div> */}
          {/* </div> */}
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

export default LandlordProfile;