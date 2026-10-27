import React from 'react';

const ContactInfoModal = ({ request, onAllow, onDeny }) => {
  if (!request) return null;

  return (
    <div style={{
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '8px',
        minWidth: '300px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          Your chat partner is requesting your contact info. Allow?
        </div>
        <button 
          onClick={onAllow}
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Allow
        </button>
        <button 
          onClick={onDeny}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Deny
        </button>
      </div>
    </div>
  );
};

export default ContactInfoModal;
