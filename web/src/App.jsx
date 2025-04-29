import { Outlet, useLocation } from 'react-router-dom';
import useAuth from './Auth/useAuth'; 
import './index.css';

export default function App() {
  const username = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="root-container min-h-screen bg-gradient-to-tr from-indigo-100 to-sky-100">
      {!isLoginPage && username && (
        <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">
            QuizVerse
          </div>
          <div className="text-md text-gray-500">
            Welcome, <span className="font-semibold text-indigo-500">{username}</span>!
          </div>
        </nav>
      )}
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
