import { default as CustomAddUserForm } from 'src/components/addForm/addUserForm';
import { Navigate } from 'react-router';
import { useUser } from 'src/hooks/UserContext';

const AddUserForm = () => {
  const { hasPermission } = useUser();

  return hasPermission('create_user') ? <CustomAddUserForm /> : <Navigate to="/auth/404" />;
};

export default AddUserForm;
