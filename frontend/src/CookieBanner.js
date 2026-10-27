// src/CookieBanner.js
import React, { useState, useEffect } from 'react';
import './CookieBanner.css';
import { useModal } from './ModalContext'; // Import the custom hook

function CookieBanner() {
  const { showModal } = useModal(); // Use the hook
  const [consent, setConsent] = useState(localStorage.getItem('cookieConsent'));
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!consent) {
      setBlocked(false);
    }
  }, [consent]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setConsent('accepted');
    setBlocked(false);
  };

  const handleDeny = () => {
    // Replace window.confirm with our new modal
    showModal({
      type: 'confirm', // This will show both "OK" and "Cancel" buttons
      message: "Without cookie permission, we won't be able to show you the site. Are you sure?",
      confirmText: "Yes, I'm sure",
      cancelText: "No, go back",
      onConfirm: () => {
        setBlocked(true); // This function runs only if the user clicks "Yes, I'm sure"
      }
    });
  };

  if (consent === 'accepted') return null;

  if (blocked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#fff',
        color: '#111',
        zIndex: 99999,
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0
      }}>
        <div>
          <h2>Cookie Permission Required</h2>
          <p>You must accept cookies to continue using this site.</p>
          <button onClick={() => setBlocked(false)} style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: '#4caf50',
            border: 'none',
            borderRadius: '5px',
            color: '#111',
            cursor: 'pointer'
          }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="interaction-blocker" />
      <div className="cookie-banner">
        <p>We use cookies to improve your experience. Please accept cookies to use the site.</p>
        <div className="cookie-buttons">
          <button className="accept" onClick={handleAccept}>Accept</button>
          <button className="deny" onClick={handleDeny}>Deny</button>
        </div>
      </div>
    </>
  );
}

export default CookieBanner;




// import React, { useState, useEffect } from 'react';
// import './CookieBanner.css';

// function CookieBanner() {
//   const [visible, setVisible] = useState(false);
//   const [blocked, setBlocked] = useState(false);

//   useEffect(() => {
//     const consent = localStorage.getItem('cookieConsent');
//     if (consent === 'accepted') {
//       setVisible(false);
//     } else {
//       setVisible(true);
//     }
//   }, []);

//   const acceptCookies = () => {
//     localStorage.setItem('cookieConsent', 'accepted');
//     setVisible(false);
//   };

//   const denyCookies = () => {
//     const confirmDeny = window.confirm("Without cookie permission, we won't be able to show you the site. Are you sure?");
//     if (!confirmDeny) return;
//     setBlocked(true); // Blocks UI
//     localStorage.removeItem('cookieConsent'); // So banner shows again on reload
//   };

//   if (!visible) return null;

//   if (blocked) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         textAlign: 'center',
//         padding: '2rem',
//         backgroundColor: '#111',
//         color: '#fff'
//       }}>
//         <div>
//           <h2>Cookie Permission Required</h2>
//           <p>You must accept cookies to continue using this site.</p>
//           <button onClick={() => setBlocked(false)} style={{
//             marginTop: '1rem',
//             padding: '0.6rem 1.2rem',
//             backgroundColor: '#4caf50',
//             border: 'none',
//             borderRadius: '5px',
//             color: '#fff',
//             cursor: 'pointer'
//           }}>
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="cookie-banner">
//       <p>
//         We use cookies to improve your experience. You need to accept cookies to use the site.
//       </p>
//       <div className="cookie-buttons">
//         <button className="accept" onClick={acceptCookies}>Accept</button>
//         <button className="deny" onClick={denyCookies}>Deny</button>
//       </div>
//     </div>
//   );
// }

// export default CookieBanner;
