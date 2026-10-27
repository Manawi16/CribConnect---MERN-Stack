import React, { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import MapContainer from './MapContainer';
import ListingSidebar from './ListingSidebar';
import FilterBar from './FilterBar';
import { initialProperties } from './listingData';
import { getDirections } from './Direction';
import './Listings.css';

function ListingsPage() {
  const [properties, setProperties] = useState(initialProperties);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('popularity');
  const propertiesPerPage = 5;
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [userLocation, setUserLocation] = useState({
    lat: 28.6139,
    lng: 77.2090,
  });
  const [activeListing, setActiveListing] = useState(initialProperties[0]); // default to first one
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeCache, setRouteCache] = useState({});
  const hoverTimeout = useRef(null);
  const currentAbort = useRef(null);

  // const handleHover = (location) => {
  //   const key = `${location.lat},${location.lng}`;
  //   clearTimeout(hoverTimeout.current);

  //   hoverTimeout.current = setTimeout(async () => {
  //     if (routeCache[key]) {
  //       setSelectedRoute(routeCache[key]);
  //       return;
  //     }

  //     if (currentAbort.current) currentAbort.current.abort();
  //     const controller = new AbortController();
  //     currentAbort.current = controller;

  //     setIsFetchingRoute(true);
  //     try {
  //       const route = await getDirections(userLocation, location, controller.signal);
  //       setRouteCache((prev) => ({ ...prev, [key]: route }));
  //       setSelectedRoute(route);
  //     } catch (err) {
  //       if (err.name !== 'AbortError') {
  //         console.error('Error fetching route:', err);
  //       }
  //     }
  //     setIsFetchingRoute(false);
  //   }, 150);
  // };
const handleHover = (location, listing) => {
  setActiveListing(listing);  // Recenter map immediately

  const key = `${location.lat},${location.lng}`;
  clearTimeout(hoverTimeout.current);

  hoverTimeout.current = setTimeout(async () => {
    if (routeCache[key]) {
      setSelectedRoute(routeCache[key]);
      return;
    }

    if (currentAbort.current) currentAbort.current.abort();
    const controller = new AbortController();
    currentAbort.current = controller;

    setIsFetchingRoute(true);
    try {
      const route = await getDirections(userLocation, location, controller.signal);
      setRouteCache(prev => ({ ...prev, [key]: route }));
      setSelectedRoute(route);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error fetching route:", err);
      }
    } finally {
      setIsFetchingRoute(false);
    }
  }, 300);  // Slightly longer debounce
};

  const [filters, setFilters] = useState({
    price: [5000, 80000],
    furnishing: [],
    category: [],
    amenities: [],
  });

  const handleFilterChange = (group, value) => {
    setFilters((prev) => ({ ...prev, [group]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];
      const furnishingMatch =
        filters.furnishing.length === 0 || filters.furnishing.includes(p.furnishing);
      const categoryMatch =
        filters.category.length === 0 || filters.category.includes(p.category);
      return priceMatch && furnishingMatch && categoryMatch;
    });
  }, [properties, filters]);

  const sortedProperties = useMemo(() => {
    let sorted = [...filteredProperties];
    switch (sortKey) {
      case 'asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        sorted.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredProperties, sortKey]);

  const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);
  const currentProperties = sortedProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  return (
    <div className="listings-page-map-layout">
      <div className="listings-column">
        <FilterBar onSortChange={setSortKey} />
        <div className="property-list">
          {currentProperties.length > 0 ? (
            currentProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onHover={() => {
                  handleHover(prop.location,prop);
                  setActiveListing(prop);
                }}
              />
            ))
          ) : (
            <p className="no-results">No properties match the current filters.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              ← Previous
            </button>
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => handlePageChange(number + 1)}
                className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}
              >
                {number + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <aside className="map-column">
        <MapContainer
          userLocation={userLocation}
          listings={properties}
          selectedRoute={selectedRoute}
          onClearRoute={() => setSelectedRoute([])}
          activeListing={activeListing}
        />
      </aside>
    </div>
  );
}

// function DetailSidebar({ property, isOpen, onToggle }) {
//   if (!property) return null;

//   const sidebarClass = isOpen ? "detail-sidebar open" : "detail-sidebar";
//   return (
//     <div className={sidebarClass}>
//       <button onClick={onToggle} className="sidebar-toggle">
//         {isOpen ? '>' : '<'}
//       </button>
//       <div className="detail-sidebar-content">
//         <h3>{property.title}</h3>
//         <p className="detail-price">₹{property.price.toLocaleString()}/month</p>
//         <img src={property.images[0]} alt={property.title} className="detail-image" />
//         <p className="detail-description">{property.description}</p>
//       </div>
//     </div>
//   );
// }

// function ListingsPage() {
//   const [properties, setProperties] = useState(initialProperties);
//   const [activeProperty, setActiveProperty] = useState(null);
//   const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortKey, setSortKey] = useState('new');
//   const propertiesPerPage = 9;

//   const [filters, setFilters] = useState({
//     price: [5000, 80000],
//     furnishing: [],
//     category: [],
//     amenities: [],
//     bhk: [],
//     gender: [],
//     ac: null,
//     wifi: null,
//     verified: null,
//     sharing: [],
//     mess: [],
//     bathrooms: [],
//     availability: null,
//     leaseType: [],
//   });

//   const handleFilterChange = (group, value) => {
//     setFilters(prev => ({
//       ...prev, [group]: value
//     }));
//     setCurrentPage(1);
//   };

//   const handleViewMap = (property) => {
//     setActiveProperty(property);
//     setIsDetailSidebarOpen(true);
//   };

//   const handleToggleDetailSidebar = () => {
//     setIsDetailSidebarOpen(!isDetailSidebarOpen);
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const filteredProperties = useMemo(() => {
//     return properties.filter(p => {
//       const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];
//       const furnishingMatch = filters.furnishing.length === 0 || filters.furnishing.includes(p.furnishing);
//       const categoryMatch = filters.category.length === 0 || filters.category.includes(p.category);
//       const amenitiesMatch = filters.amenities.every(amenity => {
//         if (amenity === 'AC') return p.ac;
//         if (amenity === 'Wi-Fi') return p.wifi;
//         const key = amenity.toLowerCase().replace(/ /g, '_');
//         return p.amenities && p.amenities[key];
//       });
//       return priceMatch && furnishingMatch && categoryMatch && amenitiesMatch;
//     });
//   }, [properties, filters]);

//   const sortedProperties = useMemo(() => {
//     let sorted = [...filteredProperties];
//     switch (sortKey) {
//       case 'asc': sorted.sort((a, b) => a.price - b.price); break;
//       case 'desc': sorted.sort((a, b) => b.price - a.price); break;
//       case 'new': sorted.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)); break;
//       default: break;
//     }
//     return sorted;
//   }, [filteredProperties, sortKey]);

//   const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);
//   const currentProperties = sortedProperties.slice((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage);

//   return (
//     <div className="listings-page">
//       {/* <ListingSidebar filters={filters} onFilterChange={handleFilterChange} /> */}
//       <main className="listings-main">
//         <div className="listings-header">
//           {/* <input type="search" placeholder="Search by location, landmark..." className="search-bar" /> */}
          
//           <FilterBar />
          
//           {/* <div className="sort-options">
//             <button className={`sort-btn ${sortKey === 'new' ? 'active' : ''}`} onClick={() => setSortKey('new')}>✓ New</button>
//             <button className={`sort-btn ${sortKey === 'asc' ? 'active' : ''}`} onClick={() => setSortKey('asc')}>Price ascending</button>
//             <button className={`sort-btn ${sortKey === 'desc' ? 'active' : ''}`} onClick={() => setSortKey('desc')}>Price descending</button>
//           </div> */}

//         </div>
//         <div className="property-grid">
//           {currentProperties.length > 0 ? (
//             currentProperties.map(prop => (
//               <Link to={`/listing/${prop.id}`} key={prop.id} className="property-card-link">
//                 <PropertyCard 
//                   property={prop}
//                   onViewMapClick={() => handleViewMap(prop)}
//                 />
//               </Link>
//             ))
//           ) : (
//             <p className="no-results">No properties match the current filters.</p>
//           )}
//         </div>
        
//         {totalPages > 1 && (
//           <div className="pagination">
//             <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-btn">← Previous</button>
//             {[...Array(totalPages).keys()].map(number => (
//               <button key={number + 1} onClick={() => handlePageChange(number + 1)} className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}>
//                 {number + 1}
//               </button>
//             ))}
//             <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn">Next →</button>
//           </div>
//         )}
//       </main>

//       <DetailSidebar 
//         property={activeProperty} 
//         isOpen={isDetailSidebarOpen} 
//         onToggle={handleToggleDetailSidebar} 
//       />
//     </div>
//   );
// }


// function DetailSidebar({ property, isOpen, onToggle }) {
//   if (!property) return null;

//   const sidebarClass = isOpen ? "detail-sidebar open" : "detail-sidebar";
//   return (
//     <div className={sidebarClass}>
//       <button onClick={onToggle} className="sidebar-toggle">
//         {isOpen ? '>' : '<'}
//       </button>
//       <div className="detail-sidebar-content">
//         <h3>{property.title}</h3>
//         <p className="detail-price">₹{property.price.toLocaleString()}/month</p>
//         <img src={property.images[0]} alt={property.title} className="detail-image" />
//         <p className="detail-description">{property.description}</p>
//       </div>
//     </div>
//   );
// }

// function ListingsPage() {
//   const [properties, setProperties] = useState(initialProperties);
//   const [activeProperty, setActiveProperty] = useState(null);
//   const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [filters, setFilters] = useState({ price: [5000, 80000], furnishing: [], category: [], amenities: [] });
//   const [sortKey, setSortKey] = useState('new');
//   const propertiesPerPage = 9;

//   const handleFilterChange = (group, value) => {
//     setFilters(prev => ({ ...prev, [group]: value }));
//     setCurrentPage(1);
//   };

//   const handleViewMap = (property) => {
//     setActiveProperty(property);
//     setIsDetailSidebarOpen(true);
//   };

//   const handleToggleDetailSidebar = () => {
//     setIsDetailSidebarOpen(!isDetailSidebarOpen);
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const filteredProperties = useMemo(() => {
//   return properties.filter(p => {
//     const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];

//     const bhkMatch = filters.bhk.length === 0 || filters.bhk.includes(p.bhk?.toString());

//     const genderMatch = filters.gender.length === 0 || filters.gender.includes(p.gender);

//     const acMatch = filters.ac === null || p.ac === filters.ac;

//     const wifiMatch = filters.wifi === null || p.wifi === filters.wifi;

//     const verifiedMatch = filters.verified === null || p.verified === filters.verified;

//     const sharingMatch = filters.sharing.length === 0 || filters.sharing.includes(p.sharing?.toString());

//     const messMatch = filters.mess.length === 0 || filters.mess.includes(p.messType); // e.g., 'Veg', 'Non-Veg'

//     const furnishingMatch = filters.furnishing.length === 0 || filters.furnishing.includes(p.furnishing);

//     const bathroomsMatch = filters.bathrooms.length === 0 || filters.bathrooms.includes(p.bathrooms?.toString());

//     const availabilityMatch = !filters.availability || p.availability === filters.availability;

//     const categoryMatch = filters.category.length === 0 || filters.category.includes(p.category);

//     const leaseTypeMatch = filters.leaseType.length === 0 || filters.leaseType.includes(p.leaseType);

//     const amenitiesMatch = filters.amenities.every(amenity => {
//       const key = amenity.toLowerCase().replace(/ /g, '_'); // e.g., 'Power Backup' -> 'power_backup'
//       return p.amenities && p.amenities[key];
//     });

//     return (
//       priceMatch &&
//       bhkMatch &&
//       genderMatch &&
//       acMatch &&
//       wifiMatch &&
//       verifiedMatch &&
//       sharingMatch &&
//       messMatch &&
//       furnishingMatch &&
//       bathroomsMatch &&
//       availabilityMatch &&
//       categoryMatch &&
//       leaseTypeMatch &&
//       amenitiesMatch
//     );
//   });
// }, [properties, filters]);


//   const sortedProperties = useMemo(() => {
//     let sorted = [...filteredProperties];
//     switch (sortKey) {
//       case 'asc': sorted.sort((a, b) => a.price - b.price); break;
//       case 'desc': sorted.sort((a, b) => b.price - a.price); break;
//       case 'new': sorted.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)); break;
//     }
//     return sorted;
//   }, [filteredProperties, sortKey]);

//   const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);
//   const currentProperties = sortedProperties.slice((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage);

//   return (
//     <div className="listings-page">
//       <ListingSidebar filters={filters} onFilterChange={handleFilterChange} />
      
//       <main className="listings-main">
//         <div className="listings-header">
//           <input type="search" placeholder="Search by location, landmark..." className="search-bar" />
//           <div className="sort-options">
//             <button className={`sort-btn ${sortKey === 'new' ? 'active' : ''}`} onClick={() => setSortKey('new')}>✓ New</button>
//             <button className={`sort-btn ${sortKey === 'asc' ? 'active' : ''}`} onClick={() => setSortKey('asc')}>Price ascending</button>
//             <button className={`sort-btn ${sortKey === 'desc' ? 'active' : ''}`} onClick={() => setSortKey('desc')}>Price descending</button>
//           </div>
//         </div>

//         <div className="property-grid">
//           {currentProperties.length > 0 ? (
//             currentProperties.map(prop => (
//               <Link to={`/listing/${prop.id}`} key={prop.id} className="property-card-link">
//                 <PropertyCard 
//                   property={prop}
//                   onViewMapClick={() => handleViewMap(prop)}
//                 />
//               </Link>
//             ))
//           ) : (
//             <p className="no-results">No properties match the current filters.</p>
//           )}
//         </div>
        
//         {totalPages > 1 && (
//           <div className="pagination">
//             <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-btn">← Previous</button>
//             {[...Array(totalPages).keys()].map(number => (
//               <button key={number + 1} onClick={() => handlePageChange(number + 1)} className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}>
//                 {number + 1}
//               </button>
//             ))}
//             <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn">Next →</button>
//           </div>
//         )}        
//       </main>

//       <DetailSidebar 
//         property={activeProperty} 
//         isOpen={isDetailSidebarOpen} 
//         onToggle={handleToggleDetailSidebar} 
//       />
//     </div>
//   );
// }

export default ListingsPage;


// function DetailSidebar({ property, isOpen, onToggle }) {
//   if (!property) return null;

//   const sidebarClass = isOpen ? "detail-sidebar open" : "detail-sidebar";
//   return (
//     <div className={sidebarClass}>
//       <button onClick={onToggle} className="sidebar-toggle">
//         {isOpen ? '>' : '<'}
//       </button>
//       <div className="detail-sidebar-content">
//         <h3>{property.title}</h3>
//         <p className="detail-price">₹{property.price.toLocaleString()}/month</p>
//         <img src={property.images[0]} alt={property.title} className="detail-image" />
//         <p className="detail-description">{property.description}</p>
//       </div>
//     </div>
//   );
// };

// function ListingsPage() {
//   const [properties, setProperties] = useState(initialProperties);
//   const [selectedProperty, setSelectedProperty] = useState(null);

//   const [activeProperty, setActiveProperty] = useState(null);
//   const [isDetailSidebarOpen, setIsDetailSidebarOpen] = useState(false);

//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const propertiesPerPage = 9; 

//   // const SideBarr = props => {
//   //   const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
//   //   return (
//   //     <div className={sidebarClass}>
//   //       <div> I slide into view </div>
//   //       <div> Me Too! </div>
//   //       <div> Me Three! </div>
//   //       <button onClick={props.toggleSidebar} className="sidebar-toggle">
//   //         Toggle Sidebar
//   //       </button>
//   //     </div>
//   //   );
//   // };

//   // const [sidebarOpen, setSideBarOpen] = useState(false);
//   // const handleViewSidebar = () => {
//   //   setSideBarOpen(!sidebarOpen);
//   // };



//   const [filters, setFilters] = useState({
//     price: [5000, 80000],
//     furnishing: [],
//     category: [],
//     amenities: [],
//   });

//   const [sortKey, setSortKey] = useState('new');

//   const handleFilterChange = (group, value) => {
//     setFilters(prev => ({ ...prev, [group]: value }));
//     setCurrentPage(1); 
//   };

//   // Filtering logic updated for the new data schema
//   const filteredProperties = useMemo(() => {
//     return properties.filter(p => {
//       // Price Check
//       const priceMatch = p.price >= filters.price[0] && p.price <= filters.price[1];
//       // Furnishing Check (if any selected)
//       const furnishingMatch = filters.furnishing.length === 0 || filters.furnishing.includes(p.furnishing);
//       // Category Check (if any selected)
//       const categoryMatch = filters.category.length === 0 || filters.category.includes(p.category);
//       // Amenities Check
//       const amenitiesMatch = filters.amenities.every(amenity => {
//         if (amenity === 'AC') return p.ac;
//         if (amenity === 'Wi-Fi') return p.wifi;
//         return p.amenities[amenity.toLowerCase().replace(' ', '_')];
//       });
//       return priceMatch && furnishingMatch && categoryMatch && amenitiesMatch;
//     });
//   }, [properties, filters]);

//   // Sorting logic
//   const sortedProperties = useMemo(() => {
//     let sorted = [...filteredProperties];
//     switch (sortKey) {
//       case 'asc':
//         sorted.sort((a, b) => a.price - b.price);
//         break;
//       case 'desc':
//         sorted.sort((a, b) => b.price - a.price);
//         break;
//       case 'new':
//         sorted.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
//         break;
//       default:
//         break;
//     }
//     return sorted;
//   }, [filteredProperties, sortKey]);

//   const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);
//   const currentProperties = sortedProperties.slice((currentPage - 1) * propertiesPerPage, currentPage * propertiesPerPage);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };
  
//   const handleViewMap = (property) => {
//     setActiveProperty(property);
//     setIsDetailSidebarOpen(true);
//   };


//   const handleCardInteraction = (property) => {
//     setActiveProperty(property);
//     setIsDetailSidebarOpen(true);
//   };
  
//   const handleToggleDetailSidebar = () => {
//     setIsDetailSidebarOpen(!isDetailSidebarOpen);
//   };

// return (
//     <div className="listings-page">
//       <ListingSidebar filters={filters} onFilterChange={handleFilterChange} />
      
//       <main className="listings-main">
//         <div className="listings-header">
//           <input type="search" placeholder="Search by location, landmark..." className="search-bar" />
//           <div className="sort-options">
//             <button className={`sort-btn ${sortKey === 'new' ? 'active' : ''}`} onClick={() => setSortKey('new')}>✓ New</button>
//             <button className={`sort-btn ${sortKey === 'asc' ? 'active' : ''}`} onClick={() => setSortKey('asc')}>Price ascending</button>
//             <button className={`sort-btn ${sortKey === 'desc' ? 'active' : ''}`} onClick={() => setSortKey('desc')}>Price descending</button>
//           </div>
//         </div>


//         {/* <span>
//           <SideBarr isOpen={sidebarOpen} toggleSidebar={handleViewSidebar} />
//         </span> */}

//         <div className="property-grid">
//           {currentProperties.length > 0 ? (
//             currentProperties.map(prop => (
//               // The entire card is now wrapped in a Link for navigation
//               <Link to={`/listing/${prop.id}`} key={prop.id} className="property-card-link">
//                 <PropertyCard 
//                   property={prop}
//                   // Pass the function to open the sidebar to the card's button
//                   onViewMapClick={() => handleViewMap(prop)}
//                 />
//               </Link>
//             ))
//           ) : (
//             <p className="no-results">No properties match the current filters.</p>
//           )}
//         </div>
        
//         {totalPages > 1 && (
//           <div className="pagination">
//             <button 
//               onClick={() => handlePageChange(currentPage - 1)} 
//               disabled={currentPage === 1}
//               className="page-btn"
//           >
//             ← Previous
//           </button>
//           {[...Array(totalPages).keys()].map(number => (
//               <button 
//                   key={number + 1} 
//                   onClick={() => handlePageChange(number + 1)}
//                   className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}
//               >
//                   {number + 1}
//               </button>
//           ))}
//           <button 
//               onClick={() => handlePageChange(currentPage + 1)} 
//               disabled={currentPage === totalPages}
//               className="page-btn"
//           >
//               Next →
//             </button>
//           </div>
//         )}        
//       </main>

//       <DetailSidebar 
//         property={activeProperty} 
//         isOpen={isDetailSidebarOpen} 
//         onToggle={handleToggleDetailSidebar} 
//       />
//     </div>
      
//   );
// }