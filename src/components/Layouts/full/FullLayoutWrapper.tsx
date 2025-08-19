import { Outlet } from 'react-router-dom';
import withAuth from 'src/components/Hoc/withAuth';

const FullLayoutWrapper = () => {
  return <Outlet />;
};

export default withAuth(FullLayoutWrapper, { requireAuth: true });
