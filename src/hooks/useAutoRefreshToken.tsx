import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from 'src/api/axiosClient';
import { useUser } from './UserContext';

const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 phút
const CHECK_INTERVAL = 2 * 60 * 1000; // kiểm tra mỗi 2 phút

export default function useAutoRefreshToken() {
  const { setToken } = useUser();
  const lastActiveRef = useRef<number>(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    // tương tác gần nhất
    const markActivity = () => {
      lastActiveRef.current = Date.now();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        markActivity();
      }
    };

    // check tương tác người dùng
    window.addEventListener('mousemove', markActivity);
    window.addEventListener('keydown', markActivity);
    window.addEventListener('click', markActivity);
    window.addEventListener('scroll', markActivity);
    window.addEventListener('visibilitychange', handleVisibility);

    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      const expiresAtStr = localStorage.getItem('expiresAt');

      if (!token || !expiresAtStr) {
        navigate('/auth/login');
        return;
      }

      const now = Date.now();
      const expiresAt = parseInt(expiresAtStr, 10);
      const remaining = expiresAt - now;

      const wasRecentlyActive = now - lastActiveRef.current < 2 * 60 * 1000; // Hoạt động trong 2 phút trở lại đây

      console.log(now, 'còn hạn');

      if (remaining <= 0) {
        // Hết hạn
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('expiresAt');
        console.log(now, 'hết hạn');
        navigate('/auth/login');
        return;
      }

      if (wasRecentlyActive && remaining < REFRESH_THRESHOLD) {
        try {
          const res = await axiosClient.post('/auth/refresh', { token: token });
          const newToken = res.data.result.token;
          const newExpiresAt = Date.now() + 10 * 60 * 60 * 1000; // 10h mới

          localStorage.setItem('token', newToken);
          localStorage.setItem('expiresAt', newExpiresAt.toString());
          setToken(newToken);

          console.log('Token refreshed');
        } catch (err) {
          console.error('Refresh token failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('expiresAt');
          navigate('/auth/login');
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', markActivity);
      window.removeEventListener('keydown', markActivity);
      window.removeEventListener('click', markActivity);
      window.removeEventListener('scroll', markActivity);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
}
