import React from 'react';
import { NavLink } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import { FaTachometerAlt, FaUser, FaThList, FaPlus } from 'react-icons/fa';
import './DashboardLayout.css';

function DashboardSidebar() {
  const user = {
    name: "Temp_account",
    avatar: "https://picsum.photos/100" 
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="user-profile">
        <img src={user.avatar} alt="User Avatar" className="avatar" />
        <p>Hello, <strong>{user.name}</strong></p>
      </div>

      <div className="subscription-card">
        <h4>Tenant</h4>
        <p>Status : Verified</p>
        <div className="sub-details">
          <span><strong>10</strong> Listings Saved</span>
          <span><strong>8</strong> Posts/Comments</span>
        </div>
      </div>

      <nav className="dashboard-nav">
        <NavLink to="/dashboard" end> <FaTachometerAlt /> Dashboard </NavLink>
        <NavLink to="/dashboard/profile"> <FaUser /> My Profile </NavLink>
        <NavLink to="/dashboard/listings"> <FaThList /> Saved Listings </NavLink>
        <NavLink to="/dashboard/add-new"> <FaPlus /> My Activity </NavLink>
      </nav>
    </aside>
  );
}

export default DashboardSidebar;