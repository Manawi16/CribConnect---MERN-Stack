import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import './MyListings.css';

// In a real app, this data would be fetched from your backend API
// based on the logged-in landlord's ID.
const dummyMyListings = [
    { id: "prop_1", title: "Modern 2 BHK in Hauz Khas", address: { city: "New Delhi" }, bhk: 2, furnishing: "full", price: 45000, images: ["https://picsum.photos/400/300?random=1"], verified: true },
    { id: "prop_6", title: "Luxury Studio in Cyber City, Gurgaon", address: { city: "Gurgaon" }, bhk: 1, furnishing: "full", price: 35000, images: ["https://picsum.photos/400/300?random=7"], verified: true },
];

function MyListings() {
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyListings = async () => {
            try {
                // Simulate API call
                // const res = await axios.get('/api/landlord/my-listings', { withCredentials: true });
                // setMyListings(res.data);
                setMyListings(dummyMyListings);
            } catch (err) {
                console.error("Failed to fetch listings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyListings();
    }, []);

    if (loading) {
        return <div className="loading-pane">Loading Your Listings...</div>;
    }

    return (
        <div className="my-listings-page">
            <div className="my-listings-header">
                <h1>My Listings</h1>
                <p>Manage, edit, or unpublish your properties.</p>
            </div>

            {myListings.length > 0 ? (
                <main className="my-listings-list">
                    {myListings.map(listing => (
                        // Each card now links to an edit page for that specific listing
                        <Link to={`/listing/${listing.id}/edit`} key={listing.id} className="property-card-edit-link">
                            <PropertyCard
                                property={listing}
                                onHover={() => {}} 
                                onLeave={() => {}} 
                            />
                        </Link>
                    ))}
                </main>
            ) : (
                <div className="no-listings-container">
                    <p>You haven't posted any listings yet.</p>
                    <Link to="/createlisting" className="create-listing-link">Post Your First Property</Link>
                </div>
            )}
        </div>
    );
}

export default MyListings;
