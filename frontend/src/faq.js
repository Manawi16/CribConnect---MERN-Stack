
import React, { useState, useEffect, useMemo } from 'react';
import './faq.css';

// This is the reusable accordion item for each question
function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <span className="faq-icon">{isOpen ? ' ' : '+'}</span>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
    fetch('/cribby_data/faqs.json')
      .then(response => response.json())
      .then(data => setFaqs(data))
      .catch(error => console.error("Failed to fetch FAQ data:", error));
  }, []);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return faqs;
    }
    return faqs.filter(faq =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faqs, searchTerm]);

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to the most common questions about listing and finding properties.</p>
      </div>

      <div className="faq-search-container">
        <input
          type="text"
          placeholder="Type your question here"
          className="faq-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="faq-search-button">Search</button>
      </div>

      <div className="faq-results-header">
        <span className="results-count">{filteredFaqs.length} Results</span>
      </div>

      <div className="faq-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <AccordionItem key={index} question={faq.q} answer={faq.a} />
          ))
        ) : (
          <p>No questions match your search.</p>
        )}
      </div>
    </div>
  );
}

export default FAQ;