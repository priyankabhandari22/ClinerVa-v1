import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role doesn't match the required role for the route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect them to their appropriate dashboard instead
    return <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
