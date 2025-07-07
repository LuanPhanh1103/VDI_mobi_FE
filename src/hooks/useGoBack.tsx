import { useNavigate } from 'react-router-dom';

const useGoBack = () => {
  const navigate = useNavigate();

  const goBack = () => {
    // Kiểm tra xem có thể quay lại không
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Nếu không có history, điều hướng về trang chủ
      navigate('/');
    }
  };

  const goBackWithFallback = (fallbackPath = '/') => {
    // Quay lại với đường dẫn dự phòng tùy chỉnh
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const canGoBack = window.history.length > 1;

  return {
    goBack,
    goBackWithFallback,
    canGoBack,
  };
};

export default useGoBack;
