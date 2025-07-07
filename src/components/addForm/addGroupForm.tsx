import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'flowbite-react';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import { useNavigate } from 'react-router';
import { useUser } from 'src/hooks/UserContext';
import { Role } from 'src/types/user/User';
import { toast } from 'react-hot-toast';

import InputText from '../input/InputText';

import './addGroupForm.css';

const addGroupForm = () => {
  const { token, theme, hasPermission } = useUser();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [isFormValidGroupName, setIsFormValidGroupName] = useState(false);

  // Memoize permission checks
  const canGetRoles = useMemo(() => hasPermission('get_all_roles'), [hasPermission]);
  const canCreateRole = useMemo(() => hasPermission('create_role'), [hasPermission]);

  // Optimize fetchRoles with useCallback
  const fetchRoles = useCallback(async () => {
    if (!canGetRoles) return;

    try {
      const res = await axiosClient.get('/roles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoles(res.data.result.map((role: Role) => role.name));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách role:', error);
    } finally {
      setLoading(false);
    }
  }, [token, canGetRoles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCancle = useCallback(() => {
    setGroupName('');
    setGroupDesc('');

    navigate('/ui/groups');
  }, [navigate]);

  const handleAddGroup = useCallback(async () => {
    if (!canCreateRole) return;

    if (!isFormValidGroupName) {
      console.log('invalid');
      return;
    }
    console.log('valid');

    try {
      setLoading(true);

      await axiosClient.post(
        '/roles',
        {
          name: groupName,
          description: groupDesc,
          permissions: [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('add group ' + groupName + ' successful');
      navigate('/ui/groups', { state: { addGroupSuccess: true } });
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [canCreateRole, isFormValidGroupName, groupName, groupDesc, token, navigate]);

  return loading ? (
    <Spinner />
  ) : (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Add New Group</h5>
      <div className="mt-6">
        <InputText
          type="text"
          label="Group Name (constant)"
          value={groupName}
          onChange={setGroupName}
          isEditable={true}
          placeholder="Enter Group Name..."
          minLength={3}
          existingValues={roles}
          onValidStateChange={setIsFormValidGroupName}
          required={true}
          errorMessages={{
            minLength: 'At least 3 character',
            duplicate: 'This group is existed',
            required: 'This field is required',
          }}
        />

        <div className="add-group-form-desc-wrapper">
          <label
            htmlFor="group-desc"
            className={`add-group-form-desc-label ${theme === 'dark' ? 'dark-theme' : ''}`}
          >
            Description
          </label>
          <textarea
            id="group-desc"
            rows={4}
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
            className={`add-group-form-desc ${theme === 'dark' ? 'dark-theme' : ''}`}
            placeholder="Enter description of the group..."
          ></textarea>
        </div>
        <div className="col-span-12 flex gap-3">
          <Button color={'primary'} onClick={handleAddGroup} disabled={!isFormValidGroupName}>
            Add
          </Button>
          <Button color={'error'} onClick={handleCancle}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default addGroupForm;
