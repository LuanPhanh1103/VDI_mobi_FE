import { default as CustomAddUserForm } from 'src/components/AddForm/AddUserForm';
import { Navigate } from 'react-router';
import { useUser } from 'src/hooks/useUser';

const AddUserForm = () => {
  const { hasPermission } = useUser();

  return hasPermission('create_user') ? <CustomAddUserForm /> : <Navigate to="/auth/404" />;
};

export default AddUserForm;
