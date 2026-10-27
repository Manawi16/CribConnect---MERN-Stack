import { useNavigate } from 'react-router-dom';
import { chatApi } from './chat/api';
import { useAuth } from './AuthContext';

export default function ConnectButton({ listing }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (!user) return null;

  const onConnect = async () => {
    const { conversationId } = await chatApi('POST','/conversations/connect', {
      landlordId: listing.landlord_id,
      listingContext: {
        id: listing._id,
        title: listing.title,
        url: `/listing/${listing._id}`,
        price: listing.price,
        thumbnailUrl: listing.coverImageUrl,
      },
    });
    navigate(`/messages/${conversationId}`);
  };

  return <button onClick={onConnect}>Connect</button>;
}
