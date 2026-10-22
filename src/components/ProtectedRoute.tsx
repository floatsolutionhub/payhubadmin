import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export default function ProtectedRoute({
  children
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasAccessToken = useAppSelector((state) => Boolean(state.auth.tokenData?.accessToken));
  const isInitializing = useAppSelector((state) => state.auth.isInitializing);

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated || !hasAccessToken) {
    return <Navigate to="/auth/admin" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}