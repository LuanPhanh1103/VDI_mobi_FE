import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuth } from 'src/hooks/useAuth';
import withAuth from 'src/components/Hoc/withAuth';
import { toast } from 'react-hot-toast';

import './authfroms.css';

const AuthLogin = () => {
  const location = useLocation();
  const theme = localStorage.getItem('flowbite-theme-mode') || 'light';

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      toast.success('Logout successful!');
    }
  }, [location.state]);


  const { login, loading } = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await login(userName, password);

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
      <Button
        type="submit"
        color={'primary'}
        className="w-full bg-primary text-white rounded-xl"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default withAuth(AuthLogin, { requireAuth: false });
