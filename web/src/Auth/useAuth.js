import { useContext } from 'react';
import { AuthContext } from '../Auth/AuthProvider';

export default function useAuth() {
  const { user } = useContext(AuthContext);
  return user || localStorage.getItem('username');
}
