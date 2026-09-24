import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Signal to Android native wrapper (FreeTubeAndroid) to dismiss the native splash screen
if (typeof window !== 'undefined') {
  try {
    (window as any).Android?.hideSplashScreen?.();
  } catch (err) {
    console.warn('Android bridge not available:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
