
const axios = require('axios');
require('dotenv').config();

const fetchPlaceDetails = async (place_id) => {
    console.log("fetchdetailsfunc",place_id)
  if (!place_id) return null;
  try {
    const { data } = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json?${place_id}&key=AlzaSyu0YMu5-zXUALC6LIek06J8_4P7BuKjnvt', {
      params: {
        place_id,
        key: process.env.GOMAPS_API_KEY_TESTING
      }
    });
    if (!data.result) {
      throw new Error("No result found for place ID");
    }
    return data.result;  // or return full response if needed
  } catch (err) {
    console.error("Place details fetch failed:", err);
    return null;
    
  }
};
module.exports = {fetchPlaceDetails};