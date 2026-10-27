const Listing = require('../models/listing');

const getFilteredListings = async (req, res) => {
  try {
    const {
      gender, verification, type, bhk, sharing, lease_type, food_type,
      ac, wifi, washing_machine, fridge, sort, lat, lng
    } = req.query;

    const filter = {};

    if (gender && gender !== 'null') filter.gender = gender;
    if (verification && verification !== 'null') filter.verified = verification === 'isVerified';
    if (type && type !== 'null') filter.category = type;
    if (bhk && bhk !== 'null') filter.bhk = Number(bhk);
    if (sharing && sharing !== 'null') filter.sharing = Number(sharing);
    if (lease_type && lease_type !== 'null') filter.lease_type = lease_type;
    if (food_type && food_type !== 'null') filter['landlord_requirements.food_type'] = food_type;
    if (ac === 'true') filter.ac = true;
    if (wifi === 'true') filter.wifi = true;
    if (washing_machine === 'true') filter['amenities.washing_machine'] = true;
    if (fridge === 'true') filter['amenities.fridge'] = true;
    console.log("filter",filter);
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      const listings = await Listing.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parsedLng, parsedLat]
            },
            distanceField: 'distance', 
            spherical: true,
            query: filter
          }
        }
      ]);
      return res.json(listings);
    }
    const listings = await Listing.find(filter).sort({ created_at: sort === 'new' ? -1 : 1 });

    return res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProperty=async(req,res)=>{
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

};
module.exports = { getFilteredListings,getProperty };
