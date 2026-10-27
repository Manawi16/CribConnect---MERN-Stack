import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import './SavedListings.css';

// In a real app, this data would be fetched from your backend API
const dummySavedListings = [
    { id: "prop_1", title: "Modern 2 BHK in Hauz Khas", address: { city: "New Delhi" }, bhk: 2, furnishing: "full", price: 45000, images: ["https://picsum.photos/400/300?random=1"], verified: true },
    { id: "prop_6", title: "Luxury Studio in Cyber City, Gurgaon", address: { city: "Gurgaon" }, bhk: 1, furnishing: "full", price: 35000, images: ["https://picsum.photos/400/300?random=7"], verified: true },
    { id: "prop_10", title: "3 BHK for Family in Mayur Vihar", address: { city: "New Delhi" }, bhk: 3, furnishing: "semi", price: 38000, images: ["https://picsum.photos/400/300?random=12"], verified: true },
];

function SavedListings() {
    const [savedListings, setSavedListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedListings = async () => {
            try {
                // Simulate API call
                setSavedListings(dummySavedListings);
            } catch (err) {
                console.error("Failed to fetch saved listings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedListings();
    }, []);

    if (loading) {
        return <div className="loading-pane">Loading Saved Listings...</div>;
    }

    return (
        <div className="saved-listings-page">
            <div className="saved-listings-header">
                <h1>My Saved Listings</h1>
                <p>All your favorite properties in one place.</p>
            </div>

            {savedListings.length > 0 ? (
                <main className="saved-listings-list">
                    {savedListings.map(listing => (
                        <PropertyCard clasName="aaaahhh"
                            key={listing.id}
                            property={listing}
                            onHover={() => {}} //ah
                            onLeave={() => {}} //ah
                        />
                    ))}
                </main>
            ) : (
                <p className="no-saved-listings">You haven't saved any listings yet.</p>
            )}
        </div>
    );
}

export default SavedListings;


// // dummy to test
// const dummySavedListings = [
//     { _id: "prop_1", title: "Modern 2 BHK in Hauz Khas", description: "Stunning, newly renovated 2 BHK with a view of the park. Perfect for young professionals or artists looking for an inspiring space.", date: "2025-08-01T15:00:00Z", likes: 45, comment_count: 5 },
//     { _id: "prop_6", title: "Luxury Studio in Cyber City, Gurgaon", description: "High-end, fully furnished studio apartment for working professionals. Includes access to society gym and pool.", date: "2025-08-01T09:00:00Z", likes: 102, comment_count: 12 },
//     { _id: "prop_10", title: "3 BHK for Family in Mayur Vihar", description: "Spacious and well-ventilated 3 BHK, perfect for families. Close to the metro and market.", date: "2025-07-27T12:00:00Z", likes: 88, comment_count: 9 },
// ];

// function SavedListings() {
//     const [savedListings, setSavedListings] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchSavedListings = async () => {
//             try {
//                 // get saved lsitings from backend
//                 setSavedListings(dummySavedListings);

//             } catch (err) {
//                 console.error("Failed to fetch saved listings:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchSavedListings();
//     }, []);

//     if (loading) {
//         return <div className="loading-pane">Loading Saved Listings...</div>;
//     }

//     return (
//         <div className="saved-listings-page">
//             <div className="saved-listings-header">
//                 <h1>My Saved Listings</h1>
//                 <p>All your favorite properties in one place.</p>
//             </div>

//             {savedListings.length > 0 ? (
//                 <main className="saved-listings-grid">
//                     {savedListings.map(listing => {
//                         const postAdapter = {
//                             _id: listing._id,
//                             title: listing.title,
//                             body: listing.description,
//                             date: listing.date,
//                             likes: listing.likes,
//                             comment_count: listing.comment_count,
//                             comments: [], 
//                             userProfileUrl: '#', 
//                             shareUrl: '#'
//                         };
//                         return (
//                             <InfoCard
//                                 key={listing._id}
//                                 post={postAdapter}
//                                 onAddComment={() => {}} // Pass a dummy function to prevent errors
//                             />
//                         );
//                     })}
//                 </main>
//             ) : (
//                 <p className="no-saved-listings">You haven't saved any listings yet.</p>
//             )}
//         </div>
//     );
// }

// export default SavedListings;
