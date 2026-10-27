// import React from 'react';

// function Drawer({ property, isOpen, onToggle }) {
//   if (!property) {
//     return null;
//   }
//   //yaha par map ki API
// const mapSrc = `API_KEY=${property.location.lat},${property.location.lng}`;
   

//   return (
//     <div className={`map-drawer ${isOpen ? 'open' : ''}`}>
//       <button onClick={onToggle} className="drawer-toggle">
//         {isOpen ? '>' : '<'}
//       </button>
//       <div className="drawer-content">
//         <h3>{property.title}</h3>
//         <p>{property.address.city}, {property.address.pincode}</p>
//         <div className="map-container">
//           <iframe
//             width="100%"
//             height="100%"
//             style={{ border: 0 }}
//             loading="lazy"
//             allowFullScreen
//             src={mapSrc}>
//           </iframe>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Drawer;