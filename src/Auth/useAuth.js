import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Auth/AuthProvider';

export default function useAuth() {
  const { user } = useContext(AuthContext); 
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user);
    } else {
      const storedUser = localStorage.getItem('username');
      if (storedUser) {
        setUsername(storedUser);
      }
    }
  }, [user]);

  return username;
}
