 import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type PrivateRouteProps = {
  children: React.JSX.Element;    
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token } = useAuth();           // usamos `token`
  const location  = useLocation();

  // si no hay token ⇒ redirige al login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // si hay token ⇒ muestra la página protegida
  return children;
};

export default PrivateRoute;
