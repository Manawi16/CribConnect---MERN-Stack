import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from './ModalContext'; 

function Signup(props) { 
  const navigate = useNavigate();
  const { showModal } = useModal(); 
  const [phone, setPhone] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({ phone: '', otp: '' });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!otpSent) {
        sendOtp();
      } else {
        verifyOtp();
      }
    }
  };

  const validatePhone = (num) => /^(\+91)?[6-9]\d{9}$/.test(num.replace(/\s+/g, ''));
  const validateOtp = (code) => /^\d{4,6}$/.test(code);

  const handleGoogleLogin = async () => {
    window.location.href = `http://localhost:5000/api/auth/preauth?flow=signup&role=${props.role}`;
  };

  const sendOtp = async () => {
    if (!validatePhone(phone)) {
      setErrors((prev) => ({ ...prev, phone: 'Enter a valid 10-digit Indian phone number' }));
      return;
    }
    setErrors((prev) => ({ ...prev, phone: '' }));
    try {
      const res = await axios.post('http://localhost:5000/api/phone/send-otp', { phone:phone.trim(),
      mode: "signup"},{ withCredentials: true });
      if (res.data.status === "pending") {
        setOtpSent(true); 
      } 
      else if (res.data.status === "error"||res.data.success === false) {
        navigate(`/error?reason=${res.data.reason || "otp_send_failed"}`);
        return;
      }
    } catch (err) {
      console.error(err);
      showModal({ message: 'Network error while sending OTP. Please try again.' });
    }
  };

  const verifyOtp = async () => {
    if (!validateOtp(otp)) {
      setErrors((prev) => ({ ...prev, otp: 'OTP must be 4 to 6 digits' }));
      return;
    }
    setErrors((prev) => ({ ...prev, otp: '' }));
    try {
      const res = await axios.post('http://localhost:5000/api/phone/verify-otp', { phone: phone.trim(), otp, mode:"signup", role:props.role },
         {
    withCredentials: true
      });
      console.log("OTP verification response:", res.data);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        showModal({
          message: 'Registration successful!',
          onConfirm: () => navigate("/dashboard") // Navigate after user clicks OK
        });
      } else {
        showModal({ message: 'Invalid OTP. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      const reason = err?.response?.data?.reason || "Something went wrong";
      navigate(`/error?reason=${reason}`);
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Sign-Up / Register</h2>
      <div className="login-form">

        <button onClick={handleGoogleLogin}>Continue with Google</button>

        <hr />

        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          placeholder="XXXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        {errors.phone && <span style={{ color: 'red', fontSize: '0.9rem' }}>{errors.phone}</span>}

        {!otpSent ? (
          <button
            onClick={sendOtp}
            disabled={!validatePhone(phone)}
            style={{ opacity: validatePhone(phone) ? 1 : 0.6, cursor: validatePhone(phone) ? 'pointer' : 'not-allowed' }}
          >
            Send OTP
          </button>
        ) : (
          <>
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              placeholder="Enter OTP"
              
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {errors.otp && <span style={{ color: 'red', fontSize: '0.9rem' }}>{errors.otp}</span>}

            <button
              onClick={verifyOtp}
              disabled={!validateOtp(otp)}
              style={{ opacity: validateOtp(otp) ? 1 : 0.6, cursor: validateOtp(otp) ? 'pointer' : 'not-allowed' }}
            >
              Verify OTP
            </button>
          </>
        )}

        <div className="privPolicy">
          By creating this account, you agree to our <Link to={"/privacypolicy"} className="property-card-link">Privacy Policy</Link> and <Link to={"/termsandconditions"} className="property-card-link">Terms & Conditions</Link>.
        </div>
    
      </div>
</div>
      
  );
}

export default Signup;