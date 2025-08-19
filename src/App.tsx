import { RouterProvider } from 'react-router';
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import customTheme from './lib/utils/theme/custom-theme';
import router from './routes/Router';
import { Toaster } from 'react-hot-toast';
import { useUser } from './hooks/useUser';

function App() {
  const { theme } = useUser();
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          // Áp dụng cho tất cả toast
          style: {
            background: theme === 'dark' ? 'var(--color-darkborder)' : '#fff',
            color: theme === 'dark' ? '#fff' : 'var(--color-dark)',
          },
        }}
      />
      <ThemeModeScript />
      <Flowbite theme={{ theme: customTheme }}>
        <RouterProvider router={router} />
      </Flowbite>
    </>
  );
}

export default App;
