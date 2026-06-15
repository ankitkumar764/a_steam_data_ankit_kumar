import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../constants/routes';

const ProtectedRoute = () => {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    // Redirect to login page if user is not authenticated
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
