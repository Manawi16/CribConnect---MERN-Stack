// src/pages/RoleSelect.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function RoleSelect(props) {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    // props.setRole(role.toLowerCase()); new role select ab
    navigate(`/signup?role=${role.toLowerCase()}`);
  };

  // const handleRoleClick = (role) => {
  //   navigate(`/signup?role=${role.toLowerCase()}`);
  // };

  return (
    <section className="slide hero" style={{ minHeight: '100vh' }}>
      <h1 style={{paddingBottom:'0rem'}}>What category defines</h1>
        <h1 >your role best?</h1>
      <p>Choose your account type:</p>
      <div className="role-buttons">
        <button className="primary-btn" onClick={() => handleRoleClick('Landlord')}>Landlord</button>
        <button className="primary-btn" onClick={() => handleRoleClick('Tenant')}>Tenant</button>
      </div>
    </section>
  );
}

export default RoleSelect;
