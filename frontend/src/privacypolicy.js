import React from 'react';
import './TermsandConditions.css'; 

function PrivacyPolicy() {
  return (
    <div className="terms-page">
      <div className="terms-header">
        <h1>Privacy Policy</h1>
        <p>Effective Date: August 5, 2025</p>
      </div>

      <div className="terms-content-list">
        <p>Crib Connect is committed to protecting your personal information and respecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard the information you provide when using our platform.</p>

        <div className="terms-section">
          <h2>1. Information We Collect</h2>
          <p>We collect minimal personal information to ensure a safe and personalized experience on our platform. The data we collect includes:</p>
          <ul>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Mobile number</li>
            <li>PAN details: Only the name and PAN number are collected — no document uploads are required.</li>
          </ul>
          <p>All PAN data is used strictly for verification purposes only, and we clearly indicate this wherever it is requested.</p>
        </div>

        <div className="terms-section">
          <h2>2. Consent-Based Sharing</h2>
          <p>We prioritize your safety and privacy by ensuring contact information is never shared publicly. Personal details such as phone numbers and email addresses are only exchanged:</p>
           <ul>
            <li>When both parties have explicitly consented,</li>
            <li>Through features designed to mutually connect landlords and tenants,</li>
            <li>In a way that maintains transparency and accountability.</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>3. Role-Based Privacy Protections</h2>
          <p>To protect the experience and autonomy of all users:</p>
          <ul>
            <li>Landlords and tenants operate in distinct spaces.</li>
            <li>Landlords are restricted from accessing community boards and tenant-specific forums, preserving a safe space for student and tenant interaction.</li>
            <li>Tenants are shielded from unsolicited reachouts or influence from landlords unless a verified match or listing interaction has taken place.</li>
          </ul>
          <p>This separation helps ensure trust, minimizes pressure, and maintains the integrity of Crib Connect as a student-first housing solution.</p>
        </div>

        <div className="terms-section">
          <h2>4. How We Use Your Data</h2>
          <p>Your information is used for:</p>
          <ul>
            <li>Account creation and verification</li>
            <li>Matching and filtering according to your preferences</li>
            <li>Facilitating secure, verified interactions</li>
            <li>Ensuring the authenticity of listings and participants</li>
            <li>Enhancing platform reliability and safety</li>
          </ul>
          <p>We do not sell or rent your personal data to any third party.</p>
        </div>
        
        <div className="terms-section">
          <h2>5. Data Security</h2>
          <p>We use industry-standard security protocols to protect your data from unauthorized access, alteration, or disclosure. Sensitive fields like contact details and PAN numbers are stored securely and only accessible for essential platform functions.</p>
        </div>

        <div className="terms-section">
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the data we store about you</li>
            <li>Request corrections or deletions</li>
            <li>Withdraw consent for contact sharing at any time</li>
            <li>Report misuse or violations through our support team</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>7. Changes to This Policy</h2>
          <p>Crib Connect may update this Privacy Policy occasionally to reflect platform improvements or legal requirements. Users will be notified of major changes, and continued use of the platform constitutes agreement with the revised policy.</p>
        </div>

        <div className="terms-section">
          <h2>8. Contact Us</h2>
          <p>If you have questions about our Privacy Policy or need to request data access or removal, please contact us at: 
          <a href="mailto:support@cribconnect.in"> support@cribconnect.in</a></p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
