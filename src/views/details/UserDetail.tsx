import { useEffect, useState } from 'react';
import { default as UsDetails } from 'src/components/userDetails/userDetails';
import { useUser } from 'src/hooks/UserContext';
import { User } from '../../types/user/User';
import { useParams } from 'react-router-dom';
import axiosClient from 'src/api/axiosClient';
import Spinner from '../spinner/Spinner';

export interface ProfilePropType {
  user: User;
}

const UserDetails = () => {
  const { token, hasPermission, userDetails } = useUser();
  const { username } = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Reset states when username changes
  useEffect(() => {
    setCurrentUser(null);
    setLoading(true);
    setLoadingUsers(true);
  }, [username]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!hasPermission('get_all_user')) {
        setLoadingUsers(false);
        return;
      }

      try {
        const res = await axiosClient.get('/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data.result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách user:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [hasPermission, token, userDetails?.id, username]);

  useEffect(() => {
    const fetchUser = async () => {
      // Đợi cho đến khi danh sách users được tải xong
      if (!username || loadingUsers) return;

      const userFound = users.find((user) => user.username === username);
      if (!userFound?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosClient.get(`/users/${userFound.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(res.data.result);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, users, token, loadingUsers]);

  // Hiển thị Spinner nếu đang tải dữ liệu
  if (loading || loadingUsers) {
    return <Spinner />;
  }

  // Nếu không tìm thấy user sau khi đã tải xong dữ liệu
  if (!currentUser) return <Spinner />;

  return <UsDetails user={currentUser} />;
};

export default UserDetails;
