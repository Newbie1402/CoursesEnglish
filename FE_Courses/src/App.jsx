import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './components/ui/toast/Toast';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
