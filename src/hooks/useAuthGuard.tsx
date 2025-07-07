import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuthGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoginPage = location.pathname.startsWith('/auth/login');

    const handleCheckToken = () => {
      const token = localStorage.getItem('token');
      const expiresAtStr = localStorage.getItem('expiresAt');
      // Không có token hoặc expiresAt → coi như chưa đăng nhập
      if (!token || !expiresAtStr) {
        console.log('hết hạn');
        navigate('/auth/login');
        return;
      }

      const expiresAt = parseInt(expiresAtStr, 10);
      const now = Date.now();

      if (expiresAt <= now) {
        // Hết hạn
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('expiresAt');
        console.log('hết hạn');
        navigate('/auth/login');
        return;
      } else console.log(now, 'còn hạn');

      // Token còn hạn → nếu đang ở trang login thì chuyển về trang chính
      if (isLoginPage) {
        navigate('/');
      }
    };

    // Kiểm tra khi hook chạy lần đầu
    handleCheckToken();

    // Kiểm tra lại mỗi 20 giây
    const intervalId = setInterval(handleCheckToken, 20000);

    // Kiểm tra lại khi quay lại tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleCheckToken();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate]);
};

export default useAuthGuard;
