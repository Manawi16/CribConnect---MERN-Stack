const express = require('express');
const router = express.Router();
const { getTenantProfile, updateTenantProfile } = require('../controllers/tenantController');

// GET profile by account_id
router.get('/profile/:user_id', getTenantProfile);

// PUT update profile
router.put('/profile/:user_id', updateTenantProfile);

module.exports = router;
