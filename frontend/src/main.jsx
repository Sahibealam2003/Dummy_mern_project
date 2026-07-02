import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store'
import './index.css'
import App from './App.jsx'

// Register Firebase service worker for offline push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[SW] Firebase messaging service worker registered:', registration.scope);
        // Force check for updates to replace old cached SW
        registration.update();
      })
      .catch((error) => {
        console.error('[SW] Service worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
