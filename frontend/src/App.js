// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import { AuthProvider } from './AuthContext';
// import ProtectedRoute from './ProtectedRoute';
// import AccessDenied from './AccessDenied';

// import Landing from './Landing';
// import Header from './header';
// import Footer from './footer';
// import HomeLanding from './HomeLanding';
// import SignupForm from './signup';
// import Login from './login';
// import RoleSelect from './RoleSelect';
// import LandlordProfile from './LandlordProfile';
// import TenantProfile from "./TenantProfile";
// import DashboardLayout from './DashboardLayout';
// import BlogPage from './BlogPage';
// import CookieBanner from './CookieBanner';
// import ErrorPage from './Error';
// import ChatButton from './ChatButton';
// import Community from './Community';
// import ContactUs from "./ContactUs";
// import ListingsPage from "./ListingsPage";
// import ListingDetailPage from './ListingDetailPage';
// import FAQ from "./faq";
// import CreatePost from "./CreatePost";
// import PostDetail from './PostDetail';
// import ScrollToTop from './ScrollToTop';
// import Verification from "./Verification";
// import CreateListing from './CreateListing';
// import TermsandConditions from './TermsandConditions';
// import PublicProfile from './PublicProfile';
// import ReportForm from "./ReportForm";
// import SavedListings from './SavedListings';
// import MyListings from './MyListings';
// import PrivacyPolicy from './privacypolicy';
// import WriteReview from './Review';

// import '@fontsource/inter'; 
// import '@fontsource/inter/700.css'; 
// import '@fontsource/playfair-display';
// import '@fontsource/playfair-display/700.css';
// import '@fontsource/poppins';

// import './App.css';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className='land'><Landing /></div>
//         <ScrollToTop />
//         <div className="App ">
//           <Header />
//           <CookieBanner /> 
//           <main className="main ">   
//             <Routes>
              
//               {/* --- Public Routes (accessible to everyone) --- */}
//               {/* <Route path="/" element={<HomeLanding />} /> */}
              
              
//               <Route path="/register" element={<RoleSelect />} />
//               <Route path="/signup" element={<SignupForm />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/termsandconditions" element={<TermsandConditions />} />
//               <Route path="/blog" element={<BlogPage />} />
//               <Route path="/error" element={<ErrorPage />} />
//               <Route path="/community" element={<Community />} /> 
//               <Route path="/listings" element={<ListingsPage />} />
//               <Route path="/listing/:id" element={<ListingDetailPage />} />
//               <Route path="/faq" element={<FAQ />} />
//               <Route path="/ContactUs" element={<ContactUs />} />
//               <Route path="/profile/:userId" element={<PublicProfile />} />
//               <Route path="/community/post/:id" element={<PostDetail />} />
//               <Route path="privacypolicy" element={<PrivacyPolicy />} />
//               <Route path="/LandlordProfile" element={<LandlordProfile />} />
//               <Route path="/cribby" element={<ChatButton />} />
              
//               {/* --- Routes for ANY Logged-in User --- */}
//               <Route element={<ProtectedRoute />}>
//                 <Route path="/dashboard" element={<DashboardLayout />} />
//                 <Route path="/verification" element={<Verification />} />
//                 <Route path="/report/:entityType/:entityId" element={<ReportForm />} />
//               </Route>

//               {/* --- Tenant-Only Routes --- */}
//               <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
//                 <Route path="/TenantProfile" element={<TenantProfile />} />  
//                 <Route path="/user/:userId/createpost" element={<CreatePost />} />
//                 <Route path="/listing/:propertyId/writereview" element={<WriteReview />} />
//                 <Route path="/listing/null/writereview" element={<WriteReview />} />
//                 <Route path="/saves" element={<SavedListings />} />

//               </Route>

//               {/* --- Landlord-Only Routes --- */}
//               <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
//                 <Route path="/LandlordProfile" element={<LandlordProfile />} />
//                 <Route path="/createlisting" element={<CreateListing />} />
//                 <Route path="/mylistings" element={<MyListings />} />
//                 <Route path="/listing/null/writereview" element={<WriteReview />} />
//               </Route>

//               {/* --- Access Denied Page --- */}
//               <Route path="/access-denied" element={<AccessDenied />} />
              
//             </Routes>
//           </main>
//           <Footer />
//           <ChatButton /> 
          
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
// src/App.js
import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ModalProvider } from './ModalProvider'; // Import the provider
import ProtectedRoute from './ProtectedRoute';
import AccessDenied from './AccessDenied';
import Landing from './Landing';
import Header from './header';
import Footer from './footer';
import HomeLanding from './HomeLanding';
import SignupForm from './signup';
import Login from './login';
import RoleSelect from './RoleSelect';
import LandlordProfile from './LandlordProfile';
import TenantProfile from "./TenantProfile";
import DashboardLayout from './DashboardLayout';
import BlogPage from './BlogPage';
import CookieBanner from './CookieBanner';
import ErrorPage from './Error';
import ChatButton from './ChatButton';
import Community from './Community';
import ContactUs from "./ContactUs";
import ListingsPage from "./ListingsPage";
import ListingDetailPage from './ListingDetailPage';
import FAQ from "./faq";
import CreatePost from "./CreatePost";
import PostDetail from './PostDetail';
import ScrollToTop from './ScrollToTop';
import Verification from "./Verification";
import CreateListing from './CreateListing';
import TermsandConditions from './TermsandConditions';
import PublicProfile from './PublicProfile';
import ReportForm from "./ReportForm";
import SavedListings from './SavedListings';
import MyListings from './MyListings';
import PrivacyPolicy from './privacypolicy';
import WriteReview from './Review';
import UserList from './chat/UserList';
import ChatView from './chat/ChatView';
import '@fontsource/inter'; 
import '@fontsource/inter/700.css'; 
import '@fontsource/playfair-display';
import '@fontsource/playfair-display/700.css';
import '@fontsource/poppins';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const mainRef = useRef(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(!isLandingPage);

  return (
    <div className="App">
      {(isHeaderVisible || !isLandingPage) && <Header />}
      <CookieBanner />
      <main ref={mainRef} className={isLandingPage ? "main-full" : "main"}>
        <Routes>
          <Route path="/" element={<Landing scrollContainerRef={mainRef} onWipeStart={() => setIsHeaderVisible(true)} />} />
          <Route path="/home" element={<HomeLanding />} />
          
          {/* Routes */}
          <Route path="/register" element={<RoleSelect />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/termsandconditions" element={<TermsandConditions />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/community" element={<Community />} /> 
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/ContactUs" element={<ContactUs />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/community/post/:id" element={<PostDetail />} />
          <Route path="privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/LandlordProfile" element={<LandlordProfile />} />
          <Route path="/cribby" element={<ChatButton />} />
          <Route path="/dashboard" element={<DashboardLayout />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/messages" element={<UserList />} />
                <Route path="/messages/:conversationId" element={<ChatView />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/report/:entityType/:entityId" element={<ReportForm />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
            <Route path="/TenantProfile" element={<TenantProfile />} />  
            <Route path="/user/:userId/createpost" element={<CreatePost />} />
            <Route path="/listing/:propertyId/writereview" element={<WriteReview />} />
            <Route path="/listing/null/writereview" element={<WriteReview />} />
            <Route path="/saves" element={<SavedListings />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
            <Route path="/LandlordProfile" element={<LandlordProfile />} />
            <Route path="/createlisting" element={<CreateListing />} />
            <Route path="/mylistings" element={<MyListings />} />
            <Route path="/listing/null/writereview" element={<WriteReview />} />
          </Route>

          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<ErrorPage type="404" />} />
        </Routes>
      </main>
      {(isHeaderVisible || !isLandingPage) && <Footer />}
      <ChatButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ModalProvider>
          <ScrollToTop />
          <AppContent />
        </ModalProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;