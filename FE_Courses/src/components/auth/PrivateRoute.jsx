import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { token, isLoading, roles } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !roles.some(role => allowedRoles.includes(role))) {
    // Không có quyền, chuyển về trang 403
    return <Navigate to="/403" replace />;
  }
  return children;
};

export default PrivateRoute;
