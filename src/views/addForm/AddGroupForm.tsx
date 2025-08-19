import { default as CustomAddGroupForm } from 'src/components/AddForm/AddGroupForm';
import { Navigate } from 'react-router';
import { useUser } from 'src/hooks/useUser';

const AddGroupForm = () => {
  const { hasPermission } = useUser();

  return hasPermission('create_role') ? <CustomAddGroupForm /> : <Navigate to="/auth/404" />;
};

export default AddGroupForm;
