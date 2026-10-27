const express = require('express');
const router = express.Router();
const {
  getLandlordProfile,
  updateLandlordProfile
} = require('../controllers/landlordController');

router.get('/profile/:user_id', getLandlordProfile);
router.put('/profile/:user_id', updateLandlordProfile);

module.exports = router;
