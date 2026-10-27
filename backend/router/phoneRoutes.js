const router = require('express').Router();
const User = require('../models/User');
require('dotenv').config();
const express = require('express');
const {routeAuthentication }= require('../middlewares/routeAuthentication');
const {generateUserToken,generateStateToken,decodeStateToken} = require('../services/generateJWT'); 
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceID = process.env.VERIFY_SERVICE_SID;


// Send OTP
router.post('/send-otp', async (req, res) => {
 const rawPhone = req.body.phone;
 const mode = req.body.mode 
  function normalizePhone(phone) {
    if (!phone) return '';
  return phone.replace(/\s+/g, '').trim();  // Removes all spaces
  }
  const phone= normalizePhone(rawPhone);

  try {
    const user = await User.findOne({ phone });
    if(mode==="signup" && user){
        return res.status(200).json({ status: "error", success: false, reason: "already_registered" });
    }
    
    if (mode === "login" && !user) {
      return res.status(200).json({status: "error", success: false, reason: "not_registered"  });
    }
    const twilio_response = await client.verify.v2.services(serviceID)
      .verifications.create({ to: phone, channel: 'sms' });
    return res.json({ status: twilio_response.status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Check OTP
router.post('/verify-otp', async (req, res) => {
  const {otp, mode ,role} = req.body;
  const rawPhone = req.body.phone;
  function normalizePhone(phone) {
    if (!phone) return '';
  return phone.replace(/\s+/g, '').trim();  // Removes all spaces
  }
  const phone= normalizePhone(rawPhone);
  let newUser = await User.findOne({ phone });
  if (!phone || !otp || !mode) {
    return res.status(400).json({ success: false, reason: "missing_fields" });
  }
  try {
    const twilioResult = await client.verify.v2
    .services(serviceID)
      .verificationChecks.create({ to: phone, code:otp });
    if (twilioResult.status !== "approved") {
      return res.status(401).json({ success: false, reason: "invalid_otp" });
    }
    if(twilioResult.status === "approved" && mode === "signup"){
      if(!role){
        return res.status(400).json({ success: false, reason: "missing_fields" });
      }
      newUser=await User.create({
        phone,
        role,
        isEmailVerified: false,
        isPhoneVerified: true
      });   
    }
    if(twilioResult.status === "approved" && mode === "login"){
      if(!newUser){
        return res.status(400).json({ success: false, reason: "not_registered" });
      }
      newUser.isPhoneVerified = true;
      await newUser.save();
    }
    const userToken = generateUserToken(newUser);
    
    res.cookie("jwtToken", userToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      }); 
    return res.json({
      success: true,
      token:userToken,
      user: {
        id: newUser._id,
        role: newUser.role,
        phone: newUser.phone,
        email: newUser.email || null,
        name: newUser.name || null,
        isPhoneVerified: newUser.isPhoneVerified,
        isEmailVerified: newUser.isEmailVerified
      }

    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports=router;