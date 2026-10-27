import axios from 'axios';
import { decodePolyline } from './decodePolyline';

export const getDirections = async (origin, destination, signal = null) => {
  try {
    console.log('Directions request:', origin, destination);

    const res = await axios.get('http://localhost:5000/api/directions', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
      },
      signal, // ✅ Pass the signal here
    });

    console.log('Directions response:', res.data);

    const encoded = res.data.routes[0].overview_polyline.points;
    return decodePolyline(encoded);
  } catch (err) {
    if (axios.isCancel(err)) {
      console.warn('Request was canceled:', err.message);
    } else if (err.name === 'CanceledError') {
      console.warn('Aborted request via signal:', err.message);
    } else {
      console.error('Error fetching directions:', err);
    }
    return [];
  }
};
