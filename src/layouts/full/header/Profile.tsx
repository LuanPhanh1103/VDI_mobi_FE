import { useState } from 'react';
import { Button, Dropdown } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router';
import axiosClient from 'src/api/axiosClient';
import Confirm from 'src/components/confirm/Confirm';
import { useUser } from 'src/hooks/UserContext';

const Profile = () => {
  const { userDetails, theme } = useUser();
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    try {
      if (token) {
        await axiosClient.post('/auth/logout', { token });
      }
    } catch (error) {
      console.warn('Lỗi khi gọi API logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('expiresAt');
      navigate('/auth/login', { state: { logoutSuccess: true } });
    }
  };

  return (
    <div className="relative group/menu">
      <Confirm
        visible={showConfirm}
        mess={'Do you want to log out?'}
        handleConfirm={handleLogout}
        handleCancel={() => {
          setShowConfirm(false);
        }}
      />
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-9 w-9 rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary flex items-center justyfy-center">
            <Icon
              icon="solar:user-bold"
              className={`avata-icon ${theme === 'dark' ? 'dark-theme' : ''}`}
            />
          </span>
        )}
      >
        <Dropdown.Item
          as={Link}
          to={`/ui/${userDetails?.username}/profile`}
          className={`px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark ${
            theme === 'dark' ? 'link-my-profile-dark-theme' : ''
          }`}
        >
          <Icon icon="solar:user-circle-outline" height={20} />
          My Profile
        </Dropdown.Item>
        <div className="p-3 pt-0">
          <Button
            as={Link}
            size={'sm'}
            to="#"
            onClick={() => setShowConfirm(true)}
            className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none"
          >
            Logout
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
