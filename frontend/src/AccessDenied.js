// src/AccessDenied.js
import React from 'react';
import ErrorPage from './Error'; // We are reusing the main ErrorPage component

function AccessDenied() {
  return <ErrorPage type="accessDenied" />;
}

export default AccessDenied;