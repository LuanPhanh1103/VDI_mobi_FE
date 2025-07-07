import HomeImgLight from '../../assets/images/backgrounds/LIGHT.png';
import HomeImgDark from '../../assets/images/backgrounds/Presentation1.png';
import MbfLogo from '../../assets/images/logos/MobiFone_logo.png';
import { useUser } from 'src/hooks/UserContext';

import './Home.css';

import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.loginSuccess) {
      toast.success('Login successful!');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);
  const { theme } = useUser();

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray relative w-full break-words overflow-hidden">
      <div className="flex items-center home-page-wrapper">
        <h3 className="home-page-copyright">
          © 2025 <img src={MbfLogo} alt="MobiFone Logo" className="home-page-mbf-logo" />
        </h3>

        <div className="home-page-content">
          <h2 className="home-page-welcome">Welcome !</h2>
          <h1 className="home-page-heading">Virtual Desktop Infrastructure</h1>
          <p className="home-page-desc">
            MobiFone VDI: Đơn giản quản lý, bảo mật dữ liệu – Hạ tầng desktop ảo hóa thông minh cho
            doanh nghiệp.
          </p>
        </div>
        <img
          className="home-page-banner"
          src={theme === 'dark' ? HomeImgDark : HomeImgLight}
          alt="Welcome to VDI - Mobifone Cloud DC"
        />
      </div>
    </div>
  );
};

export default Home;
