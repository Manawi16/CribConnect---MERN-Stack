const express = require('express');
const router = express.Router();
const axios = require('axios');
const {routeAuthentication }= require('../middlewares/routeAuthentication');
const listing = require('../models/listing');
const Review = require('../models/review');
const { getFilteredListings,getProperty } = require('../controllers/listingController');
require('dotenv').config();
const upload = require('../middlewares/imageUpload')
const{fetchPlaceDetails}=require("../services/getLatLng")
const Listing = require('../models/listing');

router.get('/all-listings',getFilteredListings);

router.get('/listings/ratings/:listingId', async (req, res) => {
   try {
    console.log("review");
        const reviews = await Review.find({ property_id: req.params.listingId })
        //  .populate(
        //     'reviewer_id',
        //     'name profile_url' 
        //  );
      console.log("re",reviews);
      res.json(reviews);
   } catch (err) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
   }
});

router.get('/listings/:id',async(req,res)=>{
  try{
    console.log("api Call ")
    const listing = await Listing.findById({_id:req.params.id});
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.status(200).json(listing);
  }catch(err){
    console.error('Error fetching property:', error);
    return res.status(500).json({ message: 'Server error' });
  }

});

router.post('/create-listings',routeAuthentication, upload.array('images', 5), async (req, res) => {
  try {
    const {place_id,
      title, description, price, category, bhk, bathrooms, furnishing, sharing,
      mess_included_veg, mess_included_nonveg, lease_type, gender, negotiation,
    } = req.body;
console.log("body",req.body);

    const addressDetails = await fetchPlaceDetails(place_id);
    if (!addressDetails) return res.status(404).json({ error: 'Invalid main address' });

    const lat = addressDetails.geometry.location.lat;
    const lng = addressDetails.geometry.location.lng;

    const files = req.files;
    console.log("image",req.files)
    const address = {
  flat: req.body.address.flat,
  area: req.body.address.area,
  city: req.body.address.city,
  state: req.body.address.state,
  pincode: req.body.address.pincode
};
const amenities = {
  ac: req.body.amenities.ac === 'true',
  wifi: req.body.amenities.wifi === 'true',
  lift: req.body.amenities.lift === 'true',
  water_purifier: req.body.amenities.water_purifier === 'true',
  stove: req.body.amenities.stove === 'true',
  inverter: req.body.amenities.inverter === 'true',
  fridge: req.body.amenities.fridge === 'true',
  washing_machine: req.body.amenities.washing_machine === 'true',
};

const landlord_requirements = {
  drink: req.body.landlord_requirements.drink === 'true',
  smoke: req.body.landlord_requirements.smoke === 'true',
  food_type: req.body.landlord_requirements.food_type || 'any',
};
const location = {
  lat,
  lng
};

const imagePaths = files.map(file => `/uploads/${file.filename}`);

const coordinates = {
  type: 'Point',
  coordinates: [lng, lat] 
};
   const listing = new Listing({
    place_id,
  title,
  landlord_id: req.user._id,
    location,
  description,
  price,
  category,
  bhk,
  bathrooms,
  furnishing,
  sharing,
  mess_included_veg: mess_included_veg === 'true',
  mess_included_nonveg: mess_included_nonveg === 'true',
  lease_type,
  gender,
  negotiation: negotiation === 'true',
  address,
  amenities,
  landlord_requirements,
  images: imagePaths,
  coordinates  
});


    await listing.save();
    res.status(201).json({ message: 'Listing created', id: listing._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



router.get('/create-listing/location', async (req, res) => {
    console.log("Calledm",req.query)
  const { pincode } = req.query;
  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ error: 'Invalid pincode' });
  }
  try {
    const {data}= await axios.get(
      `https://maps.gomaps.pro/maps/api/geocode/json?address=${pincode}&key=${ process.env.GOMAPS_API_KEY_TESTING}`,
    );
    const result = data.results?.[0];
        if (!result) return res.status(404).json({ error: "No data found" });
        const components = result.address_components;
        const getComponent = (type) => {
          return components.find(comp => comp.types.includes(type))?.long_name || '';
        };
        const response = {
          city: getComponent("locality") || getComponent("sublocality") ||getComponent("administrative_area_level_2") || "",
          state: getComponent("administrative_area_level_1") || "",
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        };
        console.log(response)
        return res.json(response);
  } catch (error) {
    console.error('Pincode lookup failed:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;