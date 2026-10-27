// // HomeLanding.js
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './App.css';

// function HomeLanding(props) {
//   const navigate = useNavigate();

//   const handleRoleClick = (role) => {
//     // Edited by manawi
//     props.setRole(role.toLowerCase());
//     //
//     navigate(`/signup?role=${role.toLowerCase()}`);
//   };

//   return (
//     <div className="home-landing main">
//       <section className="slide hero">
//         <h1>Welcome to Crib Connect!</h1>
//         <p>Connecting you with your next stay, one that feels like home.</p>
//         <div className="role-buttons">
//           <button className="primary-btn" onClick={() => handleRoleClick('Landlord')}>Landlord</button>
//           <button className="primary-btn" onClick={() => handleRoleClick('Tenant')}>Tenant</button>
//         </div>
//       </section>

//       <section className="slide image-slide" style={{ backgroundImage: 'url("https://www.amberserviceapartments.com/wp-content/uploads/2021/05/Photo-Mar-27-6-45-12-PM.jpg")' }}></section>

//       <section className="slide cta">
//         <p>Choose your profile and let the magic happen!</p>
//         <button className="primary-btn">Something something</button>
//       </section>

//       <section className="slide image-slide" style={{ backgroundImage: 'url("https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2022/10/17143931/India-Gate.jpg")' }}></section>

//       <section className="slide testimonials">
//         <h2>Testaments</h2>
//         <p>What our users have to say:</p>
//         <div className="testimonial-grid">
//           {[...Array(6)].map((_, i) => (
//             <div className="testimonial-card" key={i}>
//               <p className="quote">"This platform made finding a PG so easy and stress-free!"</p>
//               <div className="user-info">
//                 <div className="avatar"></div>
//                 <div className="user-meta">
//                   <p className="user-name">Name Here</p>
//                   <p className="user-role">Student</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default HomeLanding;

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { FaShieldAlt, FaUsers, FaComments, FaMapMarkedAlt, FaStar, FaRobot } from 'react-icons/fa';
import './Homepage.css';

function HomeLanding(props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRoleClick = (role) => {
    navigate(`/signup?role=${role.toLowerCase()}`);
  };

  const features = [
    { icon: <FaComments />, title: "Private Messaging", subtitle: "Connect securely.", image: "https://images.unsplash.com/photo-1608093310256-d8289063a5e7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { icon: <FaShieldAlt />, title: "Verification Transparency", subtitle: "Trust every listing.", image: "https://images.unsplash.com/photo-1695374688937-15aac874a509?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { icon: <FaMapMarkedAlt />, title: "Map Integrated", subtitle: "Explore locations.", image: "https://images.unsplash.com/photo-1562993610-121a6b465200?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { icon: <FaUsers />, title: "Community", subtitle: "Find your tribe.", image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { icon: <FaStar />, title: "3Rs - Review, Rate, Report", subtitle: "Ensure quality.", image: "https://images.unsplash.com/photo-1740108759517-4c534705c2aa?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { icon: <FaRobot />, title: "Cribby - Chatbot", subtitle: "Get instant help.", image: "https://images.unsplash.com/photo-1659018966834-99be9746b49e?q=80&w=1498&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  ];

  return (
    <div className="homepage">
      <section className="hero-section">
        {user ? (
          <div className="hero-logged-in">
            <h1>CRIB CONNECT</h1>
            <p className="subtitle">Connecting you with your next stay, one that feels like home.</p>
            <Link to="/listings" className="btn-primary">Browse Listings</Link>
          </div>
        ) : (
          <div className="hero-logged-out">
            <div className="hero-content">
              <h1>Find Your Place, Connect with Your People.</h1>
              <p className="subtitle">The trusted platform for students and young professionals to find verified PGs, flats, and roommates in the city.</p>
              <div className="role-buttons">
                <button className="btn-primary" onClick={() => handleRoleClick('Tenant')}>I'm a Tenant</button>
                <button className="btn-secondary" onClick={() => handleRoleClick('Landlord')}>I'm a Landlord</button>
              </div>
            </div>
            <div className="hero-image">
              <img src="https://i.pinimg.com/736x/9a/f4/c2/9af4c21851455476c2b069a7ae87b3fb.jpg" alt="Modern living space" />
            </div>
          </div>
        )}
      </section>
      
      <section className="">
        <div className="features-carousel">
          <div className="features-track">
            {[...features, ...features].map((feature, index) => (
              <div className="feature-slide" key={index}>
                <img src={feature.image} alt={feature.title} className="feature-slide-image" />
                <div className="feature-slide-content">
                    <div className="feature-slide-icon">{feature.icon}</div>
                    <h4>{feature.title}</h4>
                    <p>{feature.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      
      <section className="image-placeholder-section">
        <div className="image-placeholder">
          <img src="https://www.lux-mag.com/wp-content/uploads/2017/02/IMG_0415.jpg" alt="Vibrant city of Delhi" />
        </div>
        <p className='caption'>This is Delhi. We get it. Find your space in the heart of the hustle.</p>
      </section>

      <section className="why-us-section">
        <h2>Why Crib Connect?</h2>
        <div className="why-us-grid">
          <div className="why-us-card">
            <div className="why-us-icon"><FaShieldAlt /></div>
            <h3>Verification First</h3>
            <p>Every landlord is vetted and every listing is checked. We prioritize your safety so you can search with confidence.</p>
          </div>
          <div className="why-us-card">
            <div className="why-us-icon"><FaUsers /></div>
            <h3>A Real Community</h3>
            <p>More than just listings. Our community boards are a tenant-only space to find roommates, share tips, and connect with peers.</p>
          </div>
          <div className="why-us-card">
            <div className="why-us-icon"><FaComments /></div>
            <h3>No Middlemen</h3>
            <p>Connect directly and securely with property owners. No hidden fees, no brokerage drama. Just straightforward communication.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeLanding;
