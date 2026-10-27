//

import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa6";
import { useAuth } from './AuthContext';
import { useModal } from './ModalContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showModal } = useModal();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');

  const [phone, setPhone] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({ phone: '', otp: '' });

  const validatePhone = (number) => {
    const cleaned = number.replace(/\s+/g, '').replace(/^(\+91)/, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  };

  const validateOtp = (input) => /^\d{4,6}$/.test(input);

  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:5000/api/auth/preauth?flow=login${role ? `&role=${role}`: ''}`;
  };

  const sendOtp = async () => {
    // Check for dummy login first to avoid sending unnecessary OTPs
    if (phone.includes('0123456789')) {
        setOtpSent(true);
        return;
    }

    if (!validatePhone(phone)) {
      setErrors((prev) => ({ ...prev, phone: 'Enter a valid 10-digit Indian phone number' }));
      return;
    }
    setErrors((prev) => ({ ...prev, phone: '' }));
    try {
      const res = await axios.post('http://localhost:5000/api/phone/send-otp', { phone, mode: "login"}, { withCredentials: true });
      if (res.data.status === "pending") {
        setOtpSent(true); 
      } else if (res.data.status === "error") {
        navigate(`/error?reason=${res.data.reason || "otp_send_failed"}`);
      }
    } catch (err) {
      showModal({ message: 'Network error while sending OTP. Please try again.' });
    }
  };

  const verifyOtp = async () => {
    // --- MASTER DUMMY LOGIN ---
    if (phone.includes('0123456789') && otp === '123456') {
        const dummyUser = {
            id: 'dummy-tenant-01',
            name: 'Master Tenant',
            role: 'tenant',
            phone: '+910123456789',
            isPhoneVerified: true,
        };
        login(dummyUser); // Update the auth context with the dummy user
        showModal({
            message: 'Master login successful!',
            onConfirm: () => navigate("/dashboard")
        });
        return; // Bypass the real API call
    }
    // --- END MASTER DUMMY LOGIN ---

    if (!validateOtp(otp)) {
      setErrors((prev) => ({ ...prev, otp: 'OTP must be 4 to 6 digits' }));
      return;
    }
    setErrors((prev) => ({ ...prev, otp: '' }));
    try {
      const res = await axios.post('http://localhost:5000/api/phone/verify-otp', { phone, otp, mode: "login", role }, { withCredentials: true });
      if (res.data.success) {
        login(res.data.user); // Update auth context
        showModal({
          message: 'Login successful!',
          onConfirm: () => navigate("/dashboard")
        });
      } else {
        showModal({ message: 'Invalid OTP. Please try again.' });
      }
    } catch (err) {
      const reason = err?.response?.data?.reason || "default";
      navigate(`/error?reason=${reason}`);
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Login</h2>
      <div className="login-form">
        <button onClick={handleGoogleLogin} className="google-login-btn">
          <FaGoogle />
          <span>Continue with Google</span>
        </button>
        
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          placeholder="+91 XXXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {errors.phone && <span style={{ color: 'red', fontSize: '0.9rem' }}>{errors.phone}</span>}

        {!otpSent ? (
          <button onClick={sendOtp}>Send OTP</button>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="otp">Enter OTP</label>
              <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Resend OTP</button>
            </div>
            <input
              type="text"
              id="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {errors.otp && <span style={{ color: 'red', fontSize: '0.9rem' }}>{errors.otp}</span>}
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        )}
      </div>
     </div>
  );
}

export default Login;