import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { io } from 'socket.io-client';
import AuthProvider from './Auth/AuthProvider'; 
import App from './App';
import Lobby from './pages/Lobby';
import Game from './pages/Game';


const URL = 'http://localhost:3000';
export const socket = io(URL);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Lobby /> },
      { path: '/:sessionId', element: <Game /> }, 
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
