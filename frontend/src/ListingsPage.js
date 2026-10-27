import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import MapContainer from './MapContainer';
import FilterBar from './FilterBar';
import axios from 'axios'; 
import { getDirections } from './Direction';
import './Listings.css';
import { IoLocationOutline } from "react-icons/io5";

const initialFilterState = {
  gender: 'null',
  verification: 'null',
  type: 'null',
  sort: 'new',
  bhk: 'null',
  sharing: 'null',
  lease_type: 'null',
  food_type: 'null',
  ac: false,
  wifi: false,
  washing_machine: false,
  fridge: false,
};
let debounceTimer = null;
function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 5;
    const [selectedRoute, setSelectedRoute] = useState([]);
    const [userLocation, setUserLocation] = useState({lat: 28.7163,lng:77.1032});//28.7163° N, 77.1032° E
    const [activeListing, setActiveListing] = useState(null);
    const [isFetchingRoute, setIsFetchingRoute] = useState(false);
    const [routeCache, setRouteCache] = useState({});
    const hoverTimeout = useRef(null);
    const currentAbort = useRef(null);
    const [loading, setLoading] = useState(true);
    const scrollup = useRef(null);
    const [filters, setFilters] = useState(initialFilterState);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchedLocation, setSearchedLocation] = useState({lat: null,lng:null});

    const navigate = useNavigate();

    const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    if (debounceTimer) clearTimeout(debounceTimer); 
    debounceTimer = setTimeout(async () => {
      if (input.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await axios.get(`http://localhost:5000/api/tenant-autocomplete?input=${input}&lat=${userLocation.lat}&lng=${userLocation.lng}`);
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Area autocomplete error:", err);
        setSuggestions([]);
      }
    }, 500); 
  };

  useEffect(() => {
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const location = searchParams.get('location');

  if (lat && lng) {
    setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
  }

  if (location) {
    setSearchInput(location);
  }
}, []);

const handleSuggestionClick = async (suggestion) => {
    if (debounceTimer) clearTimeout(debounceTimer);
  setSearchInput(suggestion.description);
  setSuggestions([]);
  setSelectedPlaceId(suggestion.place_id);
  setShowSuggestions(false);
  try {
    const response=await axios.post(`http://localhost:5000/api/getLatLng?place_id=${suggestion.place_id}`);
    setUserLocation({lat:response.data.lat,lng:response.data.lng});    
      setSearchParams(prev => {
    const params = new URLSearchParams(prev);
    params.set('location', suggestion.description);
    params.set('lat', response.data.lat);
    params.set('lng', response.data.lng);
    setSearchedLocation({lat:response.data.lat,lng:response.data.lng})
    return params;
    });
  } catch (err) {
    console.error("Error Fetching Lat Lng:", err);
  }
  console.log("Selected place ID:", suggestion.place_id);
}
  useEffect(() => {
    const updatedFilters = { ...initialFilterState };
    for (const [key, value] of searchParams.entries()) {
      if (['ac', 'wifi', 'washing_machine', 'fridge'].includes(key)) {
        updatedFilters[key] = value === 'true'; // booleans
      } else {
        updatedFilters[key] = value;
      }
    }
    setFilters(updatedFilters);
  }, [searchParams]);


  const updateURLParams = (updated) => {
    const newParams = {};
    for (const key in updated) {
      if (
        updated[key] !== 'null' && 
        !(typeof updated[key] === 'boolean' && updated[key] === false)
      ) {
        newParams[key] = updated[key];
      }
    }
    setSearchParams(newParams);
  };
  const handleFilterChange = (name, value) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    setCurrentPage(1);
    updateURLParams(updated);
  };

  const handleMoreFiltersApply = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    setCurrentPage(1);
    updateURLParams(updated);
  };

    const handleHover = (location, listing) => {
        setActiveListing(listing); 

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
        }, 300); 
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        if (scrollup.current) {
            scrollup.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const totalPages = Math.ceil(properties.length / propertiesPerPage);
    const currentProperties = properties.slice(
        (currentPage - 1) * propertiesPerPage,
        currentPage * propertiesPerPage
    );

    const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(
            ([_, v]) => v !== '' && v !== null && v !== undefined && v !== 'null'
        )
    );

    // useEffect(() => {
    //     const fetchFilteredListings = async () => {
    //         setLoading(true);
    //         try {
    //           console.log("Fetching listings with filters:", filters);
    //             const params = new URLSearchParams(filters).toString();
    //             console.log("Fetching listings with params:", params);
    //             const res = await axios(`http://localhost:5000/api/all-listings?${params}`);
    //             setProperties(res.data);
    //             if (res.data.length > 0) {
    //                 setActiveListing(res.data[0]);
    //             } else {
    //                 setActiveListing(null);
    //             }
    //         } catch (error) {
    //             console.error("Failed to fetch listings:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchFilteredListings();
    // }, [filters]);
useEffect(() => {
  const fetchFilteredListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        lat: userLocation.lat,
        lng: userLocation.lng,
      }).toString();

      console.log("Fetching listings with params:", params);

      const res = await axios(`http://localhost:5000/api/all-listings?${params}`);
      setProperties(res.data);
            console.log("res dis",res.data[0]?.distance)
      if (res.data.length > 0) {
        setActiveListing(res.data[0]);
      } else {
        setActiveListing(null);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchFilteredListings();
}, [filters, userLocation]); // 

    useEffect(() => {
        if (!userLocation || currentProperties.length === 0) return;
        currentProperties.forEach((listing) => {
            const key = `${listing.location.lat},${listing.location.lng}`;
            if (routeCache[key]) return;
            getDirections(userLocation, listing.location)
                .then((route) => {
                    if (route && route.length > 1) {
                        setRouteCache((prev) => ({
                            ...prev,
                            [key]: route,
                        }));
                    }
                })
                .catch((err) => {
                    console.warn(`Prefetch route failed for ${key}:`, err.message);
                });
        });
    }, [userLocation, currentProperties, routeCache]);

    return (
        <div className="listings-page-map-layout">
            <div className="listings-column" ref={scrollup}>
                <div className="search-bar-container">
                    <IoLocationOutline className="search-icon" />
                     <input
                        type="text"
                        placeholder="Search your location"
                        className="search-input"
                        value={searchInput}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)} // delay to allow click
                    />

                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="suggestions-list">
                        {suggestions.map((sugg, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(sugg)}>
                            {sugg.description}
                            {console.log("des",sugg.description)}
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
                 <FilterBar 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                  onApplyMoreFilters={handleMoreFiltersApply} 
                />
                <div className="property-list">
                    {loading ? (
                        <p>Loading...</p>
                    ) : currentProperties.length > 0 ? (
                        currentProperties.map((prop) => (
                            <PropertyCard
                                key={prop._id}
                                property={prop}
                                onHover={() => {
                                    handleHover(prop.location, prop);
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
                    searchedLocation={searchedLocation}
                    listings={properties}
                    selectedRoute={selectedRoute}
                    onClearRoute={() => setSelectedRoute([])}
                    activeListing={activeListing}
                />
            </aside>
        </div>
    );
}

export default ListingsPage;