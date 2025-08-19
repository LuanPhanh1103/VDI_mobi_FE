import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { Table } from 'flowbite-react';
import Search from '../Search/Search';
import { Link } from 'react-router';
import Confirm from '../Confirm/Confirm';
import { User } from 'src/types/user/User';
import { useUser } from 'src/hooks/useUser';
import axiosClient from 'src/lib/api/axiosClient';
import Spinner from 'src/components/Spinner/Spinner';

import './UsersTable.css';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router';

const UsersTable = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.addUserSuccess) {
      toast.success('Add user successful!');
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.updateInfoUsersuccess) {
      toast.success('User information updated successfully!');
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.updatePasswordUsersuccess) {
      toast.success('User password updated successfully!');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const { hasPermission, token, userDetails, theme } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [searchKey, setSearchKey] = useState(''); // Thay thế usersFilter
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Memoize filtered users thay vì dùng state riêng
  const filteredUsers = useMemo(() => {
    if (!searchKey.trim()) return users;
    return users.filter((user) => user.email?.includes(searchKey.trim()));
  }, [users, searchKey]);

  // Memoize permissions để tránh re-render không cần thiết
  const canGetAllUsers = useMemo(() => hasPermission('get_all_user'), [hasPermission]);
  const canCreateUser = useMemo(() => hasPermission('create_user'), [hasPermission]);
  const canDeleteUser = useMemo(() => hasPermission('delete_user'), [hasPermission]);
  const canGetAllRoles = useMemo(() => hasPermission('get_all_roles'), [hasPermission]);
  const canGetAllVDI = useMemo(() => hasPermission('get_all_VDI'), [hasPermission]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!canGetAllUsers) return;

      try {
        setLoading(true);
        const res = await axiosClient.get('/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data.result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [canGetAllUsers, token]);

  // Sử dụng useCallback để tránh re-render Search component
  const handleSearch = useCallback((key: string) => {
    setSearchKey(key);
  }, []);

  const handleShowConfirm = useCallback((item: User) => {
    setSelectedUser({ ...item });
    setShowConfirm(true);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(false);
    setSelectedUser(null);
  }, []);

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser || !canDeleteUser) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser.id));
      setShowConfirm(false);
      setSelectedUser(null);
      console.log('delete user ' + selectedUser.username);
      toast.success(`Delete user ${selectedUser.username} successful!`);
    } catch (error) {
      console.error('Lỗi khi xóa user:', error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [selectedUser, canDeleteUser, token]);

  // Memoize style objects để tránh tạo mới mỗi lần render
  const selectedUserNameStyle = useMemo(
    () => ({
      color: theme === 'dark' ? 'var(--color-dark-link)' : 'var(--color-primary)',
      fontSize: '1.1rem',
      padding: '0 2px',
    }),
    [theme],
  );

  const badgeStyle = useMemo(() => ({ fontSize: '0.9rem' }), []);

  const noPermissionStyle = useMemo(() => ({ cursor: 'initial' }), []);
  const noDesktopStyle = useMemo(() => ({ cursor: 'initial' }), []);

  // Component UserRow để tối ưu rendering
  const UserRow = useMemo(
    () =>
      ({ user }: { user: User }) =>
        (
          <Table.Row key={user.id}>
            <Table.Cell className="whitespace-nowrap ps-6">
              <h6 className={`text-sm user-name-link ${theme === 'dark' ? 'dark-theme' : ''}`}>
                <Link to={`/users/${user.username}`}>{user.username}</Link>
              </h6>
            </Table.Cell>
            <Table.Cell>
              <div className="flex gap-3 items-center">
                <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                  <h6 className="text-wrap">{`${user.firstName} ${user.lastName}`}</h6>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <div className="flex gap-3 items-center">
                <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                  <h6 className="text-wrap">{user.email}</h6>
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              <Badge
                color={user.gender === 'MALE' ? 'lightsuccess' : 'lighterror'}
                className={user.gender === 'MALE' ? 'text-success' : 'lighterror'}
              >
                <span style={badgeStyle}>{user.gender === 'MALE' ? '+' : '--'}</span>
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <h6 className="text-wrap">{user.age}</h6>
            </Table.Cell>
            <Table.Cell>
              {user.roles.map((group, index) => (
                <h6
                  key={index}
                  className={`text-sm user-name-link ${theme === 'dark' ? 'dark-theme' : ''}`}
                  style={!canGetAllRoles ? noPermissionStyle : undefined}
                >
                  {canGetAllRoles ? (
                    <Link to={`/groups/${group.name}`}>{group.name}</Link>
                  ) : (
                    <p>{group.name}</p>
                  )}
                </h6>
              ))}
            </Table.Cell>
            <Table.Cell>
              {user.virtualDesktops.length > 0 ? (
                user.virtualDesktops.map((desktop, index) => (
                  <h6
                    key={index}
                    className={`text-sm user-name-link ${theme === 'dark' ? 'dark-theme' : ''}`}
                    style={!canGetAllVDI ? noPermissionStyle : undefined}
                  >
                    {canGetAllVDI ? (
                      <Link to={`/desktops/${desktop.name}`}>{desktop.name}</Link>
                    ) : (
                      <p>{desktop.name}</p>
                    )}
                  </h6>
                ))
              ) : (
                <h6
                  className={`text-sm user-name-link ${theme === 'dark' ? 'dark-theme' : ''}`}
                  style={noDesktopStyle}
                >
                  ----
                </h6>
              )}
            </Table.Cell>
            {canDeleteUser && (
              <Table.Cell>
                {userDetails?.id !== user.id && (
                  <button className="delete-btn" onClick={() => handleShowConfirm(user)}>
                    <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                  </button>
                )}
              </Table.Cell>
            )}
          </Table.Row>
        ),
    [
      theme,
      canGetAllRoles,
      canGetAllVDI,
      canDeleteUser,
      userDetails?.id,
      badgeStyle,
      noPermissionStyle,
      noDesktopStyle,
      handleShowConfirm,
    ],
  );

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <div className="flex items-center justify-between">
          <h5 className="card-title">User Management</h5>
          <Search placeholder={'Enter email'} handleSearch={handleSearch} />

          <Confirm
            visible={showConfirm}
            mess={
              <>
                Are you sure you want to delete user:{' '}
                <strong style={selectedUserNameStyle}>{selectedUser?.username} </strong>?
              </>
            }
            handleConfirm={handleDeleteUser}
            handleCancel={handleCancelConfirm}
          />
        </div>
        {canCreateUser && (
          <div>
            <Button
              as={Link}
              color={'primary'}
              style={{ marginLeft: 'auto', marginTop: '14px', maxWidth: 'fit-content' }}
              to={'/users/addUser'}
            >
              Add User
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
                  <Table.HeadCell className="p-6">Username</Table.HeadCell>
                  <Table.HeadCell>FullName</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Gender</Table.HeadCell>
                  <Table.HeadCell>Age</Table.HeadCell>
                  <Table.HeadCell>Group</Table.HeadCell>
                  <Table.HeadCell>Desktop</Table.HeadCell>
                  {canDeleteUser && <Table.HeadCell></Table.HeadCell>}
                </Table.Head>
                <Table.Body className="divide-y divide-border dark:divide-darkborder ">
                  {filteredUsers.map((user) => (
                    <UserRow key={user.id} user={user} />
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

export { UsersTable };
