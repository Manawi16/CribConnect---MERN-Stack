import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleRoute = ({ children, allowed }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!allowed.includes(user.role)) return <Navigate to="/error" />;
  return children;
};

export default RoleRoute;