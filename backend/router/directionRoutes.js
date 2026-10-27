const router = require('express').Router();
const axios = require('axios');

// Parse "a,b" and normalize to Google-style "lat,lng" string.
// Accepts either lat,lng or lng,lat in the input.
function normalizeCoord(param) {
  if (!param) throw new Error('Missing coordinate');
  const [rawA, rawB] = String(param).split(',').map(s => s.trim());
  const a = Number(rawA), b = Number(rawB);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('Bad coordinate numbers');

  // Decide which is lat vs lng by range
  // lat ∈ [-90,90], lng ∈ [-180,180]
  let lat, lng;
  if (a >= -90 && a <= 90 && b >= -180 && b <= 180) {
    // received lat,lng
    lat = a; lng = b;
  } else if (a >= -180 && a <= 180 && b >= -90 && b <= 90) {
    // received lng,lat
    lng = a; lat = b;
  } else {
    throw new Error('Out-of-range coordinate');
  }
  return `${lat.toFixed(6)},${lng.toFixed(6)}`; // Google expects "lat,lng"
}

router.get('/directions', async (req, res) => {
  try {
    const originNorm = normalizeCoord(req.query.origin);
    const destNorm = normalizeCoord(req.query.destination);

    const apiKey = "AlzaSyu0YMu5-zXUALC6LIek06J8_4P7BuKjnvt" // optional
    const params = {
      origin: originNorm,
      destination: destNorm,
      mode: req.query.mode || 'driving',
      units: 'metric'
    };
    if (apiKey) params.key = apiKey;

    const response = await axios.get(
      'https://maps.gomaps.pro/maps/api/directions/json',
      { params, timeout: 10000 }
    );

    // Bubble up provider-side problems (e.g., ZERO_RESULTS, INVALID_REQUEST)
    if (response.data && response.data.status && response.data.status !== 'OK') {
      return res.status(502).json({
        ok: false,
        provider_status: response.data.status,
        provider_error: response.data.error_message || null
      });
    }

    return res.json(response.data);
  } catch (err) {
    // Log more detail to server console for debugging
    const status = err.response?.status;
    const providerBody = err.response?.data;
    console.error('Directions error:', {
      message: err.message,
      status,
      providerBody
    });

    // Return something actionable to the client
    return res.status(500).json({
      ok: false,
      error: 'Directions fetch failed',
      details: status ? `Provider HTTP ${status}` : 'No provider response',
      hint: 'Check coordinate order, API key/quota, and connectivity'
    });
  }
});

module.exports = router;
