import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './css/globals.css';
import App from './App.tsx';
import Spinner from 'src/components/Spinner/Spinner.tsx';
import { store, persistor } from './store';

createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<Spinner />}>
    <Provider store={store}>
      <PersistGate loading={<Spinner />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </Suspense>,
);
