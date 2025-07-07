import { Badge, Button, Table } from 'flowbite-react';
import Search from '../Search/Search';
import { Link } from 'react-router';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Role } from 'src/types/user/User';
import { useUser } from 'src/hooks/UserContext';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import { toast } from 'react-hot-toast';

import './Groups.css';
import Confirm from '../confirm/Confirm';
import { useLocation, useNavigate } from 'react-router';

const GroupsTable = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.addGroupSuccess) {
      toast.success('Add group successful!');
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.updateGroupSuccess) {
      toast.success('Update group successful!');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const { token, theme, hasPermission } = useUser();
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchKey, setSearchKey] = useState(''); // Thay thế rolesFilter
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Memoize filtered roles thay vì dùng state riêng
  const filteredRoles = useMemo(() => {
    if (!searchKey.trim()) return roles;
    return roles.filter((role) => role.name?.includes(searchKey.trim()));
  }, [roles, searchKey]);

  // Memoize permissions để tránh re-render không cần thiết
  const canGetAllRoles = useMemo(() => hasPermission('get_all_roles'), [hasPermission]);
  const canCreateRole = useMemo(() => hasPermission('create_role'), [hasPermission]);
  const canDeleteRole = useMemo(() => hasPermission('delete_role'), [hasPermission]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!canGetAllRoles) return;

      try {
        setLoading(true);
        const res = await axiosClient.get('/roles', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRoles(res.data.result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token, canGetAllRoles]);

  // Sử dụng useCallback để tránh re-render Search component
  const handleSearch = useCallback((key: string) => {
    setSearchKey(key);
  }, []);

  const handleShowConfirm = useCallback((item: Role) => {
    setSelectedRole({ ...item });
    setShowConfirm(true);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(false);
    setSelectedRole(null);
  }, []);

  const handleDeleteRole = useCallback(async () => {
    if (!selectedRole || !canDeleteRole) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/roles/${selectedRole?.name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoles((prevRoles) => prevRoles.filter((role) => role.name !== selectedRole?.name));
      setShowConfirm(false);
      setSelectedRole(null);
      console.log('delete role ' + selectedRole?.name + ' successful');
      toast.success(`Delete group ${selectedRole?.name} successful!`);
    } catch (error) {
      console.error('Lỗi khi xóa role:', error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, canDeleteRole, token]);

  // Memoize style object để tránh tạo mới mỗi lần render
  const selectedRoleNameStyle = useMemo(
    () => ({
      color: theme === 'dark' ? 'var(--color-dark-link)' : 'var(--color-primary)',
      fontSize: '1.1rem',
      padding: '0 2px',
    }),
    [theme],
  );

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <div className="flex items-center justify-between">
          <h5 className="card-title">Group Management</h5>
          <Search placeholder={'Enter group name'} handleSearch={handleSearch} />

          <Confirm
            visible={showConfirm}
            mess={
              <>
                Are you sure you want to delete group:{' '}
                <strong style={selectedRoleNameStyle}>{selectedRole?.name} </strong>?
              </>
            }
            handleConfirm={handleDeleteRole}
            handleCancel={handleCancelConfirm}
          />
        </div>
        {canCreateRole && (
          <div>
            <Button
              as={Link}
              color={'primary'}
              style={{ marginLeft: 'auto', marginTop: '14px', maxWidth: 'fit-content' }}
              to={'/ui/groups/addGroup'}
            >
              Add Group
              <Icon icon="solar:add-circle-bold" height={22} />
            </Button>
          </div>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <div className="mt-3">
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Group Name</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Default</Table.HeadCell>
                  {canDeleteRole && <Table.HeadCell></Table.HeadCell>}
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                  {filteredRoles.map((item, index) => (
                    <Table.Row key={item.name || index}>
                      {/* Sử dụng item.name làm key thay vì index */}
                      <Table.Cell className="whitespace-nowrap">
                        <h6
                          className={`text-sm group-name-link ${
                            theme === 'dark' ? 'dark-theme' : ''
                          }`}
                        >
                          <Link to={`/ui/groups/${item.name}`}>{item.name}</Link>
                        </h6>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={true ? `lightsuccess` : 'lighterror'}
                          className={true ? `text-success` : 'lighterror'}
                        >
                          <span style={{ fontSize: '0.9rem' }}>{true ? `+` : '--'}</span>
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            item.name === 'ADMIN' || item.name === 'USER'
                              ? `lightsuccess`
                              : 'lighterror'
                          }
                          className={
                            item.name === 'ADMIN' || item.name === 'USER'
                              ? `text-success`
                              : 'lighterror'
                          }
                        >
                          <span style={{ fontSize: '0.9rem' }}>
                            {item.name === 'ADMIN' || item.name === 'USER' ? `+` : '--'}
                          </span>
                        </Badge>
                      </Table.Cell>
                      {canDeleteRole && (
                        <Table.Cell>
                          {item.name !== 'ADMIN' && item.name !== 'USER' && (
                            <button className="delete-btn" onClick={() => handleShowConfirm(item)}>
                              <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                            </button>
                          )}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GroupsTable;
