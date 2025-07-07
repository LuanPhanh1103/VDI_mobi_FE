import { Outlet } from 'react-router-dom';
import useAuthGuard from 'src/hooks/useAuthGuard';
import useAutoRefreshToken from 'src/hooks/useAutoRefreshToken';

const FullLayoutWrapper = () => {
  useAuthGuard();
  useAutoRefreshToken();
  return <Outlet />;
};

export default FullLayoutWrapper;
