import { Outlet } from 'react-router-dom';
import useAuth from './Auth/useAuth'; 

export default function App() {
  const username = useAuth();

  return (
    <div className="root-container">
      <nav>Welcome!! {username}</nav>
      <Outlet />
    </div>
  );
}
