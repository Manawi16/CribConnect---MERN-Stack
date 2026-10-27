import './ListingPopupCard.css';
import { IoLocationOutline } from "react-icons/io5";

const ListingPopupCard = ({ distance, title, city, price }) => {
  // Format distance properly
  const formattedDistance =
    distance < 1000
      ? `${Math.round(distance)} meters away`
      : `${(distance / 1000).toFixed(1)} km away`;

  return (
  <div className="popup-card">
    <p><IoLocationOutline /> <strong>{Number(distance).toFixed(1)} km</strong> away</p>

    <p>Starts from:</p>
    <p><span className="price">₹{price}</span> / month*</p>
  </div>
  );
};

export default ListingPopupCard;
