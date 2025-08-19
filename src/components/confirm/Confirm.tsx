import { Button } from 'flowbite-react';
import './Confirm.css';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useUser } from 'src/hooks/useUser';
import Logo from '/src/assets/images/logos/logo.png';
import LogoDark from '/src/assets/images/logos/logo-dark.png';

interface confirmPropType {
  mess: React.ReactNode;
  visible: boolean;
  handleConfirm: () => void;
  handleCancel: () => void;
}

const Confirm = ({ mess, visible, handleConfirm, handleCancel }: confirmPropType) => {
  const { theme } = useUser();

  if (!visible) return null;

  return (
    <div className="overlay">
      <div className={`popup ${theme === 'dark' ? 'dark-theme' : ''}`}>
        <div className="flex mb-10">
          <div style={{ maxWidth: '68px' }}>
            <img src={theme === 'dark' ? LogoDark : Logo} alt="logo" />
          </div>
          <Icon
            onClick={handleCancel}
            icon="solar:close-square-broken"
            height={24}
            className="close-btn"
          />
        </div>
        <p className={`popup-mess ${theme === 'dark' ? 'dark-theme' : ''}`}>{mess}</p>
        <div className="popup-action">
          <Button color={'primary'} className="confirm-btn" onClick={handleConfirm}>
            Confirm
          </Button>
          <Button color={'error'} className="cancel-btn" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
