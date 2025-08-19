import LogoIcon from '/src/assets/images/logos/logo-icon.png';
import { Link } from 'react-router';
import { useLocation } from 'react-router-dom';

const Logo = () => {
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith('/auth/login');
  return (
    <Link to={isLoginPage ? '#' : '/'}>
      <img src={LogoIcon} alt="logo" />
    </Link>
  );
};

export default Logo;
