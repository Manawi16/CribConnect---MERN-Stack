import React from 'react';

const ImageModal = ({ src, onClose }) => {
  return (
    <div 
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
        >
        
        </button>
        <img 
          src={src} 
          alt="Modal content"
          style={{ 
            maxWidth: '90vw', 
            maxHeight: '90vh',
            objectFit: 'contain'
          }} 
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageModal;
