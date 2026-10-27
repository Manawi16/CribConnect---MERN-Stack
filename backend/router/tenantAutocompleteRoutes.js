const router = require('express').Router();
const {routeAuthentication }= require('../middlewares/routeAuthentication');
const{fetchPlaceDetails}=require("../services/getLatLng")
const axios = require('axios');
require('dotenv').config();


router.get("/tenant-autocomplete", async (req, res) => {
    console.log("Received autocomplete request:", req.query);
    const { input, lat, lng } = req.query;
    if (!input || input.length < 3) {
      return res.status(400).json({ error: "Minimum 3 characters required" });
    }
    try {
        console.log("query",req.query)
      const { data } = await axios.get(`https://maps.gomaps.pro/maps/api/place/autocomplete/json?${input}&key=AlzaSyu0YMu5-zXUALC6LIek06J8_4P7BuKjnvt`,{
        params: {
            input,
            key: process.env.GOMAPS_API_KEY_TESTING, //process.env.GOMAPS_API_KEY_TENANT
            // location: lat && lng ? `${lat},${lng}` : undefined,
            // radius: lat && lng ? 10000 : undefined,
      }});
      const predictions = data.predictions.map(p => ({
        description: p.description,
        place_id: p.place_id
    }));
      return res.json({ suggestions: predictions });
    } catch (err) {
        console.error("Autocomplete error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/getLatLng",async(req,res)=>{
     try {
        console.log("GET lat lng api called");
    const{place_id}=req.query;
    const response=await fetchPlaceDetails(place_id);
    console.log("res",response.geometry);
    const lat = response.geometry.location.lat || 28.7163;
    const lng = response.geometry.location.lng || 77.1032;
    console.log("latlng",lat,lng);
    return res.status(200).json({lat,lng})
     }catch(err){
        console.error("Place details fetch failed:", err.message);
        return null;
     }
});
module.exports = router;