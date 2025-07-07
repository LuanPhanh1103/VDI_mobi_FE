import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button } from 'flowbite-react';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import { useNavigate, useParams } from 'react-router';
import { useUser } from 'src/hooks/UserContext';
import { Role, Permission } from 'src/types/user/User';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import './GroupDetails.css';
import { Icon } from '@iconify/react/dist/iconify.js';
import { toast } from 'react-hot-toast';
import useGoBack from 'src/hooks/useGoBack';

const GroupDetails = () => {
  const { token, theme, hasPermission } = useUser();
  const navigate = useNavigate();
  const { groupName } = useParams();
  const { goBack } = useGoBack();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Role>();
  const [originalGroup, setOriginalGroup] = useState<Role>(); // Tên rõ ràng hơn
  const [groupDesc, setGroupDesc] = useState('');

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoize permissions để tránh tính toán lại không cần thiết
  const canGetAllRoles = useMemo(() => hasPermission('get_all_roles'), [hasPermission]);
  const canUpdateRole = useMemo(() => hasPermission('update_role'), [hasPermission]);

  // Memoize available permissions (permissions chưa được assign)
  const availablePermissions = useMemo(() => {
    if (!currentGroup?.permissions || !permissions) return permissions;

    const assignedPermissionNames = currentGroup.permissions.map((per) => per.name);
    return permissions.filter((per) => !assignedPermissionNames.includes(per.name));
  }, [currentGroup?.permissions, permissions]);

  // Memoize style objects
  const groupNameStyle = useMemo(() => ({ color: 'var(--color-primary)' }), []);
  const badgeStyle = useMemo(() => ({ fontSize: '0.9rem' }), []);
  const editBadgeStyle = useMemo(() => ({ cursor: 'pointer', fontSize: '0.9rem' }), []);

  // Fetch roles và permissions song song
  useEffect(() => {
    const fetchData = async () => {
      if (!canGetAllRoles) {
        setLoading(false);
        return;
      }

      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          axiosClient.get('/roles', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosClient.get('/permissions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Set permissions
        setPermissions(permissionsResponse.data.result);

        // Find current group
        const foundGroup = rolesResponse.data.result.find((role: Role) => role.name === groupName);
        if (foundGroup) {
          setCurrentGroup(foundGroup);
          setOriginalGroup({ ...foundGroup }); // Deep copy
          setGroupDesc(foundGroup.description || '');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, canGetAllRoles, groupName]);

  const handleRemovePermission = useCallback((oldPer: Permission) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        permissions: prev.permissions.filter((per) => per.name !== oldPer.name),
      };
    });
  }, []);

  const handleAddPermission = useCallback((newPer: Permission) => {
    setCurrentGroup((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        permissions: [...prev.permissions, newPer],
      };
    });
  }, []);

  const handleCancel = useCallback(() => {
    if (originalGroup) {
      setGroupDesc(originalGroup.description || '');
      setCurrentGroup({ ...originalGroup });
    }
    setIsEdit(false);
  }, [originalGroup]);

  const handleEdit = useCallback(() => {
    setIsEdit(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!canUpdateRole || !currentGroup) return;

    try {
      setLoading(true);

      await axiosClient.put(
        `/roles/${groupName}`,
        {
          description: groupDesc,
          permissions: currentGroup.permissions.map((per) => per.name),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('update group ' + groupName + ' successful');
      navigate('/ui/groups', { state: { updateGroupSuccess: true } });
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [canUpdateRole, currentGroup, groupDesc, groupName, token, navigate]);

  // Component cho permission item để tránh re-render không cần thiết
  const PermissionItem = useMemo(
    () =>
      ({
        permission,
        isAssigned,
        onToggle,
      }: {
        permission: Permission;
        isAssigned: boolean;
        onToggle: (permission: Permission) => void;
      }) =>
        (
          <li className="group-details-permissions-item" key={permission.name}>
            <Badge
              color={isAssigned ? 'lightsuccess' : 'lighterror'}
              className={isAssigned ? 'text-success' : 'lighterror'}
              style={isEdit ? editBadgeStyle : badgeStyle}
              onClick={isEdit ? () => onToggle(permission) : undefined}
            >
              <span>{isAssigned ? '+' : '--'}</span>
            </Badge>
            <p
              className={`group-details-permissions-item-name ${
                theme === 'dark' ? 'dark-theme' : ''
              }`}
              data-tooltip-id="tooltip-permission-desc"
              data-tooltip-place="top"
              data-tooltip-trigger="click"
              data-tooltip-content={permission.description}
              title="Click to view description"
            >
              {permission.name}
            </p>
            <Tooltip
              id="tooltip-permission-desc"
              place="top"
              className={`tooltip-permission-desc ${theme === 'dark' ? 'dark-theme' : ''}`}
              openOnClick
            />
          </li>
        ),
    [theme, isEdit, editBadgeStyle, badgeStyle],
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <button onClick={goBack} className="mb-2 inline-block" title="Go Back">
        <Icon
          className={`details-back-icon ${theme === 'dark' ? 'dark-theme' : ''}`}
          icon="solar:map-arrow-left-bold-duotone"
          height="30"
        />
      </button>

      <h5 className="card-title">
        <p>
          {isEdit ? 'Edit ' : ''}Group <strong style={groupNameStyle}>{groupName}</strong>
        </p>
      </h5>

      <div className="mt-6">
        <div className="add-group-form-desc-wrapper">
          <label
            htmlFor="group-desc"
            className={`add-group-form-desc-label ${theme === 'dark' ? 'dark-theme' : ''}`}
          >
            Description
          </label>
          {!isEdit ? (
            <p className={`group-details-desc ${theme === 'dark' ? 'dark-theme' : ''}`}>
              {groupDesc || 'No description.'}
            </p>
          ) : (
            <textarea
              id="group-desc"
              rows={4}
              className={`add-group-form-desc ${theme === 'dark' ? 'dark-theme' : ''}`}
              placeholder="Enter description of the group..."
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
            />
          )}
        </div>

        <div className="group-details-permissions">
          <h5 className="group-details-permissions-heading">Permission(s)</h5>
          {!isEdit && (!currentGroup?.permissions || currentGroup.permissions.length === 0) ? (
            <p className="group-details-desc">No permission</p>
          ) : (
            <ul className="group-details-permissions-list">
              {/* Assigned permissions */}
              {currentGroup?.permissions.map((permission) => (
                <PermissionItem
                  key={permission.name}
                  permission={permission}
                  isAssigned={true}
                  onToggle={handleRemovePermission}
                />
              ))}

              {/* Separator khi edit mode */}
              {isEdit && currentGroup?.permissions && currentGroup.permissions.length > 0 && (
                <span
                  className={`group-details-permissions-separate ${
                    theme === 'dark' ? 'dark-theme' : ''
                  }`}
                />
              )}

              {/* Available permissions khi edit mode */}
              {isEdit &&
                availablePermissions.map((permission) => (
                  <PermissionItem
                    key={permission.name}
                    permission={permission}
                    isAssigned={false}
                    onToggle={handleAddPermission}
                  />
                ))}
            </ul>
          )}
        </div>

        {canUpdateRole && (
          <div className="col-span-12 flex gap-3">
            {!isEdit ? (
              <Button color="primary" onClick={handleEdit}>
                Edit
              </Button>
            ) : (
              <>
                <Button color="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button color="error" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;
