import React, { useState, useCallback } from 'react';
import { ModalContext } from './ModalContext';
import './Modal.css';

const ModalComponent = ({ modalState, hideModal }) => {
  if (!modalState.isOpen) {
    return null;
  }

  const { message, type, onConfirm, confirmText, cancelText } = modalState;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    hideModal();
  };

  const handleCancel = () => {
    hideModal();
  };

  return (
    <div className="modal-overlay" onMouseDown={handleCancel}>
      <div className="modal-content" onMouseDown={e => e.stopPropagation()}>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          {type === 'confirm' && (
            <button onClick={handleCancel} className="modal-btn cancel">
              {cancelText || 'Cancel'}
            </button>
          )}
          <button onClick={handleConfirm} className="modal-btn confirm">
            {confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    message: '', 
    type: 'alert', 
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  const showModal = useCallback((options) => {
    setModalState({ ...options, isOpen: true });
  }, []);

  const hideModal = useCallback(() => {
    setModalState(prevState => ({ ...prevState, isOpen: false }));
  }, []);

  const value = { showModal, hideModal };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalComponent modalState={modalState} hideModal={hideModal} />
    </ModalContext.Provider>
  );
};