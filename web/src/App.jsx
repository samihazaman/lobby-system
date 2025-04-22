import { Outlet, useLocation } from 'react-router-dom';
import useAuth from './Auth/useAuth'; 
import './index.css';


export default function App() {
  const username = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';


  return (
    <div className="root-container">
      {!isLoginPage && username && (
        <nav className="bg-blue-100 p-4 text-center text-blue-800 font-medium">
          Welcome!! {username}
        </nav>
      )}
      <Outlet />
    </div>
  );
}
