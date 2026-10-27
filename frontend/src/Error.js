// src/Error.js
import React from 'react';
import { useSearchParams, Link } from "react-router-dom";
import { IoWarningOutline, IoBanOutline, IoHelpCircleOutline } from "react-icons/io5";
import './Error.css'; // Import the new CSS

const errorDetails = {
  '404': {
    icon: <IoHelpCircleOutline className="error-icon" />,
    title: '404 - Page Not Found',
    message: "Oops! The page you are looking for does not exist. It might have been moved or deleted.",
  },
  'accessDenied': {
    icon: <IoBanOutline className="error-icon info" />,
    title: 'Access Denied',
    message: "Sorry, you don't have the necessary permissions to view this page.",
  },
  'login_invalid_oauth_state': {
    icon: <IoWarningOutline className="error-icon" />,
    title: 'Login Failed',
    message: 'Something went wrong with Google login. Please try again.',
  },
  'login_not_registered': {
    icon: <IoWarningOutline className="error-icon" />,
    title: 'Login Failed',
    message: 'No account was found with these details. Please sign up first.',
  },
  'login_already_registered': {
    icon: <IoWarningOutline className="error-icon" />,
    title: 'Registration Failed',
    message: 'An account with these details already exists. Please log in instead.',
  },
  'default': {
    icon: <IoWarningOutline className="error-icon" />,
    title: 'An Error Occurred',
    message: 'Something went wrong on our end. Please try again in a little while.',
  }
};

function ErrorPage({ type }) {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  // Determine which error to show
  // A direct 'type' prop takes precedence over a URL 'reason'
  const errorKey = type || `login_${reason}` || 'default';
  const details = errorDetails[errorKey] || errorDetails['default'];

  return (
    <div className="error-page-container">
      {details.icon}
      <h1 className="error-title">{details.title}</h1>
      <p className="error-message">{details.message}</p>
      <Link to="/home" className="error-home-link">
        Go to Homepage
      </Link>
    </div>
  );
}

export default ErrorPage;