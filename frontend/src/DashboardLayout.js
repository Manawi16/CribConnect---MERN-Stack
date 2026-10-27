// import React, { useState, useMemo } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from './AuthContext';
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
// import { FaUser, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationCircle, FaStar } from 'react-icons/fa';
// import './DashboardLayout.css';

// const greetings = ["Hello", "Welcome", "Hi there"];

// const dummyLandlordListings = [
//     { id: 'prop_1', title: 'Modern 2 BHK in Hauz Khas', image: 'https://picsum.photos/400/300?random=1' },
//     { id: 'prop_6', title: 'Luxury Studio in Cyber City', image: 'https://picsum.photos/400/300?random=7' },
//     { id: 'prop_10', title: '3 BHK for Family in Mayur Vihar', image: 'https://picsum.photos/400/300?random=12' },
// ];

// const dummyTenantSaves = [
//     { id: 'prop_2', title: '1 BHK Flat in Saket', image: 'https://picsum.photos/400/300?random=3' },
//     { id: 'prop_4', title: 'Unfurnished Room in Mukherjee Nagar', image: 'https://picsum.photos/400/300?random=5' },
// ];

// function Carousel({ items, type }) {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const goToPrevious = () => {
//     const isFirstSlide = currentIndex === 0;
//     const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
//     setCurrentIndex(newIndex);
//   };

//   const goToNext = () => {
//     const isLastSlide = currentIndex === items.length - 1;
//     const newIndex = isLastSlide ? 0 : currentIndex + 1;
//     setCurrentIndex(newIndex);
//   };

//   if (!items || items.length === 0) {
//     return <div className="carousel-empty">No items to display.</div>;
//   }
  
//   const item = items[currentIndex];
//   const linkTo = type === 'landlord' ? `/listing/${item.id}/edit` : `/listing/${item.id}`;

//   return (
//     <div className="carousel-wrapper">
//       <button onClick={goToPrevious} className="carousel-arrow"><FaChevronLeft /></button>
//       <Link to={linkTo} className="carousel-card-link">
//         <div className="carousel-card">
//             <img src={item.image} alt={item.title} />
//             <h4>{item.title}</h4>
//         </div>
//       </Link>
//       <button onClick={goToNext} className="carousel-arrow">
//         <FaChevronRight />
//       </button>
//     </div>
//   );
// }

// function DashboardSidebar() {
//   const { user } = useAuth();
//   const isLandlord = user?.role === 'landlord';
//   const isTenant = user?.role === 'tenant';
  
//   const randomGreeting = useMemo(() => greetings[Math.floor(Math.random() * greetings.length)], []);
  
//   const verificationStatus = user?.verification_status || 'Unverified'; //get from backend

//   const statusConfig = {
//     Verified: {
//       icon: <FaCheckCircle className="status-icon verified" />,
//       message: "Your account is verified and trusted by the community.",
//       showButton: false,
//     },
//     Pending: {
//       icon: <FaHourglassHalf className="status-icon pending" />,
//       message: "Your account is under verification. We'll get back to you in 5-7 days.",
//       showButton: false,
//     },
//     Denied: {
//       icon: <FaTimesCircle className="status-icon denied" />,
//       message: "You were denied Verification! Contact us if you think this is a mistake.",
//       showButton: true,
//     },
//     Unverified: {
//       icon: <FaExclamationCircle className="status-icon unverified" />,
//       message: "Your account is NOT verified. Verify now to build trust.",
//       showButton: true,
//     },
//   };

//   const currentStatus = statusConfig[verificationStatus] || statusConfig['Unverified'];

//   return (
//     <div className="dashboard-page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
//       <div className="dashboard-header">
//         <h1>{randomGreeting}, {user?.name || 'User'}!</h1>
//         <p>Manage your account, view your activity, and find what you need.</p>
//       </div>

//       <div className="dashboard-section">
//         <h2 className="section-heading">My Profile</h2>
//         <div className="profile-card-large">
//             <div className="profile-card-icon"><FaUser /></div>
//             <div className="profile-card-text">
//                 <h3>Update your details</h3>
//                 <p>Keep your contact information and preferences up to date to ensure a seamless experience.</p>
//             </div>
//             <Link to={isLandlord ? "/landlordprofile" : "/tenantprofile"} className="profile-card-btn">
//                 Edit Profile
//             </Link>
//         </div>
//       </div>

//       <div className="dashboard-section">
//         <h2 className="section-heading">{isLandlord ? "My Listings" : "Saved Listings"}</h2>
//         <Carousel items={isLandlord ? dummyLandlordListings : dummyTenantSaves} type={user?.role} />
//       </div>

      
//         <div className="dashboard-section">
//             <h2 className="section-heading">Verification Status</h2>
//             <div className="status-card">
//                 {currentStatus.icon}
//                 <div className="status-text">
//                     <h3>{verificationStatus}</h3>
//                     <p>{currentStatus.message}</p>
//                     {currentStatus.showButton && (
//                         <Link to="/verification" className="verify-now-btn">Verify Now</Link>
//                     )}
//                 </div>
//             </div>
//         </div>
//         <div className="dashboard-section">
//             <h2 className="section-heading">Review Us</h2>
//             <div className="review-card">
//                 <div className="review-stars">
//                     <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
//                 </div>
//                 <div className="status-text">
//                 <h3>Enjoying Crib Connect?</h3>
//                 <p>Help us improve by leaving a review of your experience!</p>
//             <div className="add-review-container" style={{ paddingTop: '1.5rem' }}>
                            
//                             <Link to={`/listing/null/writereview`} >
//                             <button className="add-review-btn">
                               
//                                   Write a Review
//                                   </button>
//                                 </Link>
//                             </div>
                        
//             </div>
//             </div>
//         </div>
      
      
//       <footer className="dashboard-footer">
//         <p>Have questions or need support? <Link to="/contactus">Contact Us</Link></p>
//       </footer>
//     </div>
//   );
// }

// export default DashboardSidebar;


// src/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { FaUserEdit, FaPlus, FaThList, FaBookmark, FaRegCommentDots, FaRegLifeRing } from 'react-icons/fa';
import { FaCheckCircle } from "react-icons/fa";
import './DashboardLayout.css';

function DashboardLayout() {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);
  const [spotlightPost, setSpotlightPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLandlord = user?.role === 'landlord';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [activityRes, spotlightRes] = await Promise.all([
          axios.get('http://localhost:5000/api/user/recent-activity', { withCredentials: true }),
          axios.get('http://localhost:5000/api/community/spotlight', { withCredentials: true })
        ]);

        if (activityRes.data) {
          setRecentActivity(activityRes.data);
        }

        if (spotlightRes.data) {
          setSpotlightPost(spotlightRes.data);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setRecentActivity([]);
        setSpotlightPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const quickActions = isLandlord ? [
    { to: "/createlisting", icon: <FaPlus />, label: "Add New Listing" },
    { to: "/mylistings", icon: <FaThList />, label: "View My Listings" },
    { to: "/messages", icon: <FaRegCommentDots />, label: "Check Messages" }
  ] : [
    { to: "/listings", icon: <FaThList />, label: "Browse Listings" },
    { to: "/saves", icon: <FaBookmark />, label: "View Saved" },
    { to: "/community", icon: <FaRegCommentDots />, label: "Ask Community" }
  ];

  return (
    <div className="dashboard-page-new">
      <div className="dashboard-header-new">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <p>Here's a quick overview of your account and activities.</p>
      </div>

      <div className="dashboard-grid-new">
        <div className="main-panel">
          <div className="panel-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-container">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.to} className="action-card">
                  <div className="action-icon">{action.icon}</div>
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="panel-section">
            <h2>Community Spotlight</h2>
            {loading ? (
              <p>Loading community post...</p>
            ) : spotlightPost ? (
              <div className="community-spotlight-card">
                <h4>{spotlightPost.title}</h4>
                <p>by {spotlightPost.author}</p>
                <Link to={`/community/post/${spotlightPost.id}`} className="spotlight-link">Join Discussion</Link>
              </div>
            ) : (
              <div className="community-spotlight-card empty">
                <p>No community posts to show right now. Why not start a discussion?</p>
                <Link to="/community" className="spotlight-link">Go to Community</Link>
              </div>
            )}
          </div>

          {/* New Contact Us Section */}
          <div className="panel-section">
            <h2>Need Help?</h2>
            <div className="contact-card">
                <div className="contact-icon"><FaRegLifeRing /></div>
                <div className="contact-text">
                    <h4>Have questions or need support?</h4>
                    <p>Our team is here to help you with any issues.</p>
                </div>
                <Link to="/contactus" className="spotlight-link">Contact Us</Link>
            </div>
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="panel-section">
            <h2>My Profile</h2>
            <div className="profile-summary-card">
              <div className="profile-summary-icon"><FaUserEdit /></div>
              <div className="profile-summary-text">
                <h4>Keep your details updated</h4>
                <p>Ensure your info is current for the best experience.</p>
              </div>
              <Link to={isLandlord ? "/landlordprofile" : "/tenantprofile"} className="summary-link">Edit Profile</Link>
            </div>
          </div>

          <div className="panel-section">
            <h2>Verification</h2>
            <div className="verification-card">
              <FaCheckCircle className="verification-icon" />
              <h4>Account Verified</h4>
              <p>Your account is trusted by the community.</p>
              <Link to="/verification" className="summary-link">View Status</Link>
            </div>
          </div>

          <div className="panel-section">
            <h2>Recent Activity</h2>
            {loading ? (
              <p>Loading activity...</p>
            ) : recentActivity.length > 0 ? (
              <ul className="activity-feed">
                {recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="activity-icon">
                      {activity.type === 'save' ? <FaBookmark /> : <FaRegCommentDots />}
                    </div>
                    <span>{activity.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-activity-text">No recent activity to show.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;