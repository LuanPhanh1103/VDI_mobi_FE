import { default as CustomAddGroupForm } from 'src/components/addForm/addGroupForm';
import { Navigate } from 'react-router';
import { useUser } from 'src/hooks/UserContext';

const AddGroupForm = () => {
  const { hasPermission } = useUser();

  return hasPermission('create_role') ? <CustomAddGroupForm /> : <Navigate to="/auth/404" />;
};

export default AddGroupForm;
