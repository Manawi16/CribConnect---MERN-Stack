import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa';
import './PublicProfile.css';

// dummy
const dummyUsers = {
  landlord_123: {
    role: 'landlord',
    name: 'Sunita Sharma',
    profile_picture: 'https://picsum.photos/200/200?random=106',
    verified: true,
    listings: [
      { id: 'prop_1', title: 'Modern 2 BHK in Hauz Khas', image: 'https://picsum.photos/400/300?random=1' },
      { id: 'prop_6', title: 'Luxury Studio in Cyber City', image: 'https://picsum.photos/400/300?random=7' },
      { id: 'prop_10', title: '3 BHK for Family in Mayur Vihar', image: 'https://picsum.photos/400/300?random=12' },
    ],
  },
  tenant_456: {
    role: 'tenant',
    name: 'Rohan Mehra',
    profile_picture: 'https://picsum.photos/200/200?random=102',
    verified: true,
    posts: [
      { id: 'post_2', title: 'How to Find Flatmates Without Killing Each Other', body: 'Finding a flatmate is like a high-stakes relationship interview...' },
      { id: 'post_8', title: 'Decor on a Budget for Your PG', body: 'A PG room can feel sterile and impersonal, but you don\'t need a big budget...' },
      { id: 'post_11', title: 'How to survive Delhi summer without AC', body: 'My PG doesn\'t have AC and I am melting. Any tips or tricks... ' },
    ],
  },
};

function Carousel({ items, type }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === items.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!items || items.length === 0) {
    return <div className="carousel-empty">No {type} found.</div>;
  }

  const item = items[currentIndex];

  return (
    <div className="carousel-container">
      {items.length > 1 && <button onClick={goToPrevious} className="carousel-arrow left"><FaChevronLeft /></button>}
      <div className="carousel-slide">
        {type === 'listings' ? (
          <Link to={`/listing/${item.id}`} className="carousel-card listing-card">
            <img src={item.image} alt={item.title} />
            <h4>{item.title}</h4>
          </Link>
        ) : (
          <Link to={`/community/post/${item.id}`} className="carousel-card post-card">
            <h4>{item.title}</h4>
            <p>{item.body}</p>
          </Link>
        )}
      </div>
      {items.length > 1 && <button onClick={goToNext} className="carousel-arrow right"><FaChevronRight /></button>}
    </div>
  );
}

function PublicProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // remove and add API 
    setTimeout(() => {
      setUser(dummyUsers[userId]);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  if (isLoading) return <div className="profile-loading">Loading...</div>;
  if (!user) return <div className="profile-loading">User not found.</div>;

  return (
    <div className="public-profile-page">
      <div className="profile-card">
        <header className="profile-card-header">
          <img src={user.profile_picture} alt={user.name} className="profile-avatar" />
          <div className="profile-name-role">
            <h2>{user.name}</h2>
            <p>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          </div>
          {user.verified && (
            <div className="verified-badge-profile">
              <FaCheckCircle />
              <span>Verified</span>
            </div>
          )}
        </header>

        <main className="profile-card-body">
          {user.role === 'landlord' ? (
            <Carousel items={user.listings} type="listings" />
          ) : (
            <Carousel items={user.posts} type="posts" />
          )}
        </main>

        <footer className="profile-card-footer">
          <Link to="/messages" className="profile-btn connect-btn">Connect</Link>
          <Link to={`/report/${user.role}/${userId}`} className="profile-btn report-btn">Report</Link>
        </footer>
      </div>
    </div>
  );
}

export default PublicProfile;