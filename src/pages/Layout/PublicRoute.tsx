import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAppSelector } from '@common/store/hooks';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};
