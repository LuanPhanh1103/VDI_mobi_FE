import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isTokenExpired, isTokenExpiringSoon } from '../../lib/utils/jwt';
import Spinner from 'src/components/Spinner/Spinner';

interface WithAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) => {
  const {
    redirectTo = '/auth/login',
    requireAuth = true
  } = options;

  const AuthenticatedComponent: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, token, refreshToken, logout, loading } = useAuth();

    useEffect(() => {
      const checkAuth = async () => {
        const isLoginPage = location.pathname.startsWith('/auth/login');

        // Nếu không yêu cầu auth và đang ở trang login
        if (!requireAuth) {
          return;
        }

        // Nếu không có token hoặc không authenticated
        if (!isAuthenticated || !token) {
          if (!isLoginPage) {
            console.log('Not authenticated, redirecting to login');
            navigate(redirectTo);
          }
          return;
        }

        // Kiểm tra token có hết hạn không
        if (isTokenExpired(token)) {
          console.log('Token expired');
          await logout();
          navigate(redirectTo);
          return;
        }

        // Nếu token sắp hết hạn (trong 5 phút), tự động refresh
        if (isTokenExpiringSoon(token, 5)) {
          try {
            console.log('Token expiring soon, refreshing...');
            await refreshToken();
          } catch (error) {
            console.error('Auto refresh failed:', error);
            await logout();
            navigate(redirectTo);
            return;
          }
        }

        // Nếu đã authenticated và đang ở trang login, redirect về home
        if (isAuthenticated && isLoginPage) {
          navigate('/');
        }
      };

      checkAuth();
    }, [isAuthenticated, token, location.pathname, navigate, refreshToken, logout]);



    if (requireAuth && !isAuthenticated) {
      return <Spinner />;
    }

    if (!requireAuth && isAuthenticated && location.pathname.startsWith('/auth/login')) {
      return <Spinner />;
    }

    return <>
      {loading && <Spinner />}
      <WrappedComponent {...props} />
      </>;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
};

export default withAuth;
