
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import ListingPopupCard from './ListingPopupCard';
import './Map.css';
import MapFlyTo from './MapFlyTo';

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/7906/7906920.png',
  iconSize: [38, 38],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
});
function AutoPopupMarker({ position, icon, isActive, children }) {
  const markerRef = useRef();
  useEffect(() => {
    if (isActive && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isActive]);
  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      <Popup maxWidth={150}>{children}</Popup>
    </Marker>
  );
}
function YouAreHereMarker({userLocation,ref,icon,position}) {
  const markerRef = useRef();

   useEffect(() => {
    // Open the popup once the marker is mounted
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [position.lat, position.lng]); 
  useEffect(() => {
    if (userLocation) {
      markerRef.current.openPopup();
    }
  }, [userLocation]);
  return (
    <Marker ref={markerRef} position={position} icon={icon}>
       <Popup permanent autoPan={false}>You are here</Popup>
    </Marker>
  );
}

const MyMap = ({ userLocation,searchedLocation, listings, selectedRoute, onClearRoute, activeListing }) => {
  const popupRefs = useRef({});
  const userMarkerRef = useRef(null);
  const [activeListingId, setActiveListingId] = useState(activeListing ? activeListing._id : null);
  const [mapCenter, setMapCenter] = useState(userLocation); // or default center

// ... inside your component:
const [showRoute, setShowRoute] = useState(false);

useEffect(() => {
  if (selectedRoute.length > 0 && userLocation) {
    setShowRoute(false); // reset before updating

    const timeout = setTimeout(() => {
      setShowRoute(true); // delay route rendering
    }, 200); // you can try 100-300ms

    return () => clearTimeout(timeout); // cleanup
  }
}, [selectedRoute, userLocation]);


  useEffect(() => {
    console.log('Active listing effect:',  activeListing?._id);
    if (listings.length && !activeListing) {
      setActiveListingId(listings[0]._id);
    } else if (activeListing) {
      setActiveListingId(activeListing._id);
    }
  }, [listings, activeListing]);


  useEffect(() => {

    if (userMarkerRef.current) {
      userMarkerRef.current.openPopup(); 
    }
  }, []);

  useEffect(() => {
    // // Close all popups
    // Object.values(popupRefs.current).forEach(p => p._source?.closePopup?.());
    if (activeListingId && popupRefs.current[activeListingId]) {
      popupRefs.current[activeListingId]._source?.openPopup?.();
    }
  }, [activeListingId]);
  return (
    <MapContainer
  center={[
    searchedLocation?.lat || userLocation.lat,
    searchedLocation?.lng || userLocation.lng
  ]}
  zoom={16}
  style={{ height: '100vh', width: '100%' }}
>

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {userLocation && (
        <YouAreHereMarker
          userLocation={userLocation}
          ref={userMarkerRef}
          icon={userIcon}
           position={[searchedLocation?.lat || userLocation.lat,
    searchedLocation?.lng || userLocation.lng]}
        >
        </YouAreHereMarker>
      )}
      {selectedRoute.length > 0 && userLocation &&(
        <>
          <MapFlyTo position={selectedRoute[selectedRoute.length - 1]} />
          <Polyline positions={selectedRoute} color="blue"pathOptions={{color: 'blue', weight: 6,opacity: 0.8, className: 'route-fade'}} />
        </>
      )}
      {/* {selectedRoute.length > 0 && userLocation && (
  <>
    <MapFlyTo position={selectedRoute[selectedRoute.length - 1]} />
    {showRoute && (
      <Polyline 
        positions={selectedRoute}  
        pathOptions={{ color: 'blue', weight: 6,opacity: 0.8, className: 'route-fade'  }}
      />
    )}
  </>
)} */}

      {/* {selectedRoute.length > 0 && listings.map((l) => (
        
        <AutoPopupMarker
          key={l._id}
          position={[l.location.lat, l.location.lng]}
          icon={customIcon}
          isActive={l._id === activeListingId}
        >
      <Link to={`/listing/${l._id}`} style={{ textDecoration: 'none' }}>
      <ListingPopupCard 
        image={l.image} 
        title={l.title} 
        city={l.address.city || l.address.state || 'Unknown Area'} 
        price={l.price}
      />
    </Link>
        </AutoPopupMarker>
      ))} */}
      {selectedRoute.length > 0 && listings.map((l) => {
        {console.log("distance",listings.distance)}
  const isUserMarker =
    l.location.lat === userLocation.lat &&
    l.location.lng === userLocation.lng;

  if (isUserMarker) return null; // Skip this listing to avoid conflict

  return (
    <AutoPopupMarker
      key={l._id}
      position={[l.location.lat, l.location.lng]}
      icon={customIcon}
      isActive={l._id === activeListingId}
    >
      <Link to={`/listing/${l._id}`} style={{ textDecoration: 'none' }}>
        <ListingPopupCard 
          distance={l.distance}
          title={l.title} 
          city={l.address.city || l.address.state || 'Unknown Area'} 
          price={l.price}
        />
      </Link>
    </AutoPopupMarker>
  );
})}

      {/* Route Clear Button */}
      <div className="map-wrapper">
        {selectedRoute.length > 0 && (
          <button className="clear-route-btn" onClick={onClearRoute}>
            Clear Route
          </button>
        )}
      </div>
    </MapContainer>
  );
};

export default MyMap;
