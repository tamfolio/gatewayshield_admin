import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAccessToken from '../../Utils/useAccessToken';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = useAccessToken()
  
  // Get the token from Redux state or localStorage
  // Adjust this based on how you store authentication state
  const userData = useSelector((state) => state.user?.currentUser?.admin);

  
  if (!token) {
    // Redirect to login with the current path as redirect parameter
    const redirectPath = `/?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
}

export default ProtectedRoute;