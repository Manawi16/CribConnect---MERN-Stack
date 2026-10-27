import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './dashboard';
import Listing from './listings';
import Community from './Community';
import Messages from './messages';
import AboutUs from './aboutus';
import Contact from './ContactUs';
import Privacy from './privacypolicy';
import FAQ from './faq';
import Support from './support';
import Help from './help';
import TnC from './termsandconditions';
import Blog from './blog';
import HomeLanding from './HomeLanding';
import LoginForm from './login';
import SignupForm from './signup';



function Content() {
  return (
    <Routes>
        <Route path="/" element={<HomeLanding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/listings" element={<Listing />} />
        <Route path="/community" element={<Community />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<Contact />} />
        <Route path="/privacypolicy" element={<Privacy />} />
        <Route path="/t-and-c" element={<TnC />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
      <Route path="/help" element={<Help />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />"
    </Routes>
  );
}

export default Content;
