import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import axiosClient from 'src/api/axiosClient';
import { useUser } from 'src/hooks/UserContext';
import useAuthGuard from 'src/hooks/useAuthGuard';
import { toast } from 'react-hot-toast';

import './authfroms.css';
import { useLocation } from 'react-router';

const AuthLogin = () => {
  const location = useLocation();
  const theme = localStorage.getItem('flowbite-theme-mode') || 'light';

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      toast.success('Logout successful!');
    }
  }, [location.state]);

  useAuthGuard();
  const { setToken, setUsername, setTheme, setUserId } = useUser();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();

  const expiresAt = Date.now() + 60 * 60 * 1000; //1 giờ

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // 1. Gọi API login
      const response = await axiosClient.post('/auth/login', {
        username: userName,
        password: password,
      });

      const { token, username, userId } = response.data.result;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      localStorage.setItem('expiresAt', expiresAt.toString());
      setToken(token);
      setUserId(userId);
      setUsername(username);
      const theme = localStorage.getItem('flowbite-theme-mode') || 'light';
      setTheme(theme);

      navigate('/', { state: { loginSuccess: true } });
    } catch (error) {
      toast.error('Login failed, review username or password');
      console.error('Đăng nhập thất bại:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="Username" value="Username" />
        </div>
        <TextInput
          id="Username"
          type="text"
          sizing="md"
          required
          placeholder="Enter username"
          className="form-control form-rounded-xl"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="userpwd" value="Password" />
        </div>
        <div className="input-password-group">
          <TextInput
            id="userpwd"
            type={isShowPassword ? 'text' : 'password'}
            sizing="md"
            required
            placeholder="Enter password"
            className="form-control form-rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Icon
            icon="solar:eye-broken"
            height="22"
            className={
              theme === 'dark'
                ? isShowPassword
                  ? 'text-white show-password-icon'
                  : 'show-password-icon'
                : isShowPassword
                ? 'text-dark show-password-icon'
                : 'show-password-icon'
            }
            onClick={() => setIsShowPassword((prev) => !prev)}
          />
        </div>
      </div>
      <div className="flex justify-between my-5">
        <div className="flex items-center gap-2">
          <Checkbox id="accept" className="checkbox" />
          <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
            Remeber this Device
          </Label>
        </div>
        <Link to={'#'} className="text-primary text-sm font-medium">
          Forgot Password ?
        </Link>
      </div>
      <Button type="submit" color={'primary'} className="w-full bg-primary text-white rounded-xl">
        Sign in
      </Button>
    </form>
  );
};

export default AuthLogin;
