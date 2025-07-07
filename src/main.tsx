import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './css/globals.css';
import App from './App.tsx';
import Spinner from './views/spinner/Spinner.tsx';
import { UserProvider } from './hooks/UserContext.tsx';

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<Spinner />}>
    <UserProvider>
      <App />
    </UserProvider>
  </Suspense>,
);
