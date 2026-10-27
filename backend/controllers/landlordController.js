const Landlord = require('../models/landlordSchema');

const getLandlordProfile = async (req, res) => {
  try {
    const landlord = await Landlord.findOne({ account_id: req.params.account_id });
    if (!landlord) return res.status(404).json({ error: "Landlord not found" });
    res.json(landlord);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateLandlordProfile = async (req, res) => {
  try {
    const updatedLandlord = await Landlord.findOneAndUpdate(
      { account_id: req.params.account_id },
      req.body,
      { new: true }
    );
    if (!updatedLandlord) return res.status(404).json({ error: "Landlord not found" });
    res.json(updatedLandlord);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};

module.exports = {
  getLandlordProfile,
  updateLandlordProfile
};
