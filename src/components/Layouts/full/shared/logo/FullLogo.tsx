import Logo from '/src/assets/images/logos/logo.png';
import LogoDark from '/src/assets/images/logos/logo-dark.png';
import { Link } from 'react-router';
import { useLocation } from 'react-router-dom';

const FullLogo = () => {
  const theme = localStorage.getItem('flowbite-theme-mode');
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith('/auth/login');

  return (
    <Link to={isLoginPage ? '#' : '/'} style={{ cursor: isLoginPage ? 'initial' : 'pointer' }}>
      <img
        src={theme === 'dark' ? LogoDark : Logo}
        alt="logo"
        className="block logo-full"
        style={isLoginPage ? { maxHeight: '72px' } : { maxHeight: '46px' }}
      />
    </Link>
  );
};

export default FullLogo;
