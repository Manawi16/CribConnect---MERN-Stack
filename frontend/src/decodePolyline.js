import polyline from '@mapbox/polyline';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

export const decodePolyline = (encoded) =>
  polyline.decode(encoded).map(([lat, lng]) => [lat, lng]);
