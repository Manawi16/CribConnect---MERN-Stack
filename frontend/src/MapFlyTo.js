import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

const MapFlyTo = ({ position }) => {
  const map = useMap();
  const prevPos = useRef(null);

  useEffect(() => {
    if (
      position &&
      (!prevPos.current || 
       prevPos.current[0] !== position[0] || 
       prevPos.current[1] !== position[1])
    ) {
      prevPos.current = position;
map.flyTo(position, 17, {
  duration: 1, // even lower duration
  easeLinearity: 0.3, // faster acceleration
});
    }
  }, [position, map]);

  return null;
};

export default MapFlyTo;
