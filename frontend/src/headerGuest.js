import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class headerGuest extends Component {
  render() {
    return (
      <nav>
        <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none' }}>
             <li><Link to="/"> Logo </Link></li>
             <li> Search_Bar_Element </li>
             <li><Link to="/listings">  </Link></li>
             <li><Link to="/community">  </Link></li>
             <li><Link to="/messages">  </Link></li>
             <li><Link to="/login">  </Link></li>
             <li><Link to="/signup">  </Link></li>
        </ul>
      </nav>
    );
  }
}

export default headerGuest;
