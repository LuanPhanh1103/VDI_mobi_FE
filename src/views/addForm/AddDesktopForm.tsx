import { default as CustomAddDesktopForm } from 'src/components/AddForm/AddDesktopForm';
import { Navigate } from 'react-router';
import { useUser } from 'src/hooks/useUser';

const AddDesktopForm = () => {
  const { hasPermission } = useUser();

  return hasPermission('create_VDI') ? <CustomAddDesktopForm /> : <Navigate to="/auth/404" />;
};

export default AddDesktopForm;
