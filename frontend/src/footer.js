import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Import the new CSS file

function Footer() {
  const footerLinks = [
    { to: "/", label: "Home" },
    { to: "/contactus", label: "Contact Us" },
    { to: "/privacypolicy", label: "Privacy Policy" },
    { to: "/termsandconditions", label: "Terms & Conditions" },
    { to: "/faq", label: "FAQ" },
    { to: "/blog", label: "Blog" }
  ];

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <ul className="footer-links">
          {footerLinks.map(({ to, label }, i) => (
            <li key={i}>
              <Link to={to} className="footer-link">{label}</Link>
            </li>
          ))}
        </ul>
        <div className="footer-copyright">
          <p>&copy; 2025 Crib Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
