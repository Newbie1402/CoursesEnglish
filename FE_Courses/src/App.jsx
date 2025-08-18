import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}

export default App;
