import React from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">Orders</h1>

        <div className="order-tabs">
          <button className="active">All Orders</button>
          <button>???</button>
          <button>????</button>
          <button>????</button>
        </div>

        <div className="orders-list">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="order-card">
              insert saved?
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
