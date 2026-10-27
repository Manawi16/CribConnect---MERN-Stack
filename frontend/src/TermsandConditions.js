import React, { useState, useMemo } from 'react';
import './TermsandConditions.css';

const termsData = [
  { 
    title: "1. Eligibility", 
    content: [
      "You must be at least 18 years old and currently enrolled in or recently graduated from a recognized academic institution.",
      "By registering, you confirm that all details you provide are accurate and truthful, including your role (Tenant or Landlord)."
    ]
  },
  { 
    title: "2. Your Account", 
    content: [
      "You are responsible for maintaining the confidentiality of your account and for all activity under it.",
      "You agree not to impersonate anyone or provide false information.",
      "We reserve the right to suspend or terminate accounts that violate these Terms or our community guidelines."
    ]
  },
  { 
    title: "3. Platform Usage", 
    content: [
      "CribConnect is meant only for housing-related use — like finding PGs, roommates, and connecting with landlords.",
      "Do not use the platform to post unrelated ads or spam, harass or mislead users, collect data without consent, or post fraudulent listings or impersonate property owners."
    ]
  },
  { 
    title: "4. Listings & Interactions", 
    content: [
      "Tenants are responsible for verifying the legitimacy of any listings or landlords they engage with.",
      "Landlords are expected to provide accurate information, legal rental terms, and respect tenant privacy.",
      "CribConnect does not own, operate, or verify the properties listed. We facilitate connections — not agreements."
    ]
  },
  { 
    title: "5. Roommate Finder & Community Boards", 
    content: [
      "You may use the roommate finder and community boards to post your requirements, listings, or housing-related needs.",
      "Hate speech, offensive content, or discriminatory language is strictly prohibited.",
      "Posts may be moderated or removed if found inappropriate or irrelevant."
    ]
  },
  { 
    title: "6. Privacy & Data", 
    content: [
      "We collect and store personal data only as described in our Privacy Policy.",
      "We don’t sell your data or expose it to third parties without your consent.",
      "By using the platform, you agree that we may contact you with updates, inquiries, or safety verifications."
    ]
  },
  { 
    title: "7. Safety Disclaimer", 
    content: [
      "While we try to keep CribConnect safe, we are not liable for disputes between tenants and landlords, misleading listings, or any offline interactions.",
      "Always meet in public places and verify rental documents before committing."
    ]
  },
  { 
    title: "8. Termination", 
    content: [
      "We may suspend or terminate your access if you violate these Terms, misuse or abuse any feature, or pose a risk to the community."
    ]
  },
  { 
    title: "9. Changes to These Terms", 
    content: [
      "We may update these Terms from time to time. Continued use of CribConnect after any changes means you accept the revised Terms."
    ]
  },
  { 
    title: "10. Contact Us", 
    content: [
      "Have a concern, report, or idea? Reach out to us at: <a href='cribconnect.support@gmail.com'>cribconnect.support@gmail.com</a>"
    ]
  }
];


function TermsandConditions() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = useMemo(() => {
    if (!searchTerm.trim()) {
      return termsData;
    }
    return termsData.filter(term =>
      term.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.content.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  return (
    <div className="terms-page">
      <div className="terms-header">
        <h1>Terms and Conditions</h1>
        <p>Find the information you need about using our platform.</p>
      </div>

      <div className="terms-search-container">
        <input
          type="text"
          placeholder="Search terms..."
          className="terms-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="terms-search-button">Search</button>
      </div>

      <div className="terms-results-header">
        <span className="results-count">{filteredTerms.length} Sections Found</span>
      </div>

      <div className="terms-content-list">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term, index) => (
            <div key={index} className="terms-section">
              <h2>{term.title}</h2>
              {term.content.map((paragraph, pIndex) => (
                <p key={pIndex}>{paragraph}</p>
              ))}
            </div>
          ))
        ) : (
          <p>No sections match your search.</p>
        )}
      </div>
    </div>
  );
}

export default TermsandConditions;