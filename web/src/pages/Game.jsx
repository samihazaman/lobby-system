import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../main';
import useAuth from '../Auth/useAuth';
import QuizGame from '../components/QuizGame';

export default function Game() {
  const { sessionId } = useParams();
  const username = useAuth();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState([]);
  const [readyUsers, setReadyUsers] = useState([]);
  const [hostLeft, setHostLeft] = useState(false);
  const [playerLeftMsg, setPlayerLeftMsg] = useState('');
  const [everyoneReady, setEveryoneReady] = useState(false);

  const handleLeave = () => {
    socket.emit('leaveRoom', { sessionId, username });
    navigate('/lobby');
  };

  useEffect(() => {
    socket.emit('joinRoom', { sessionId, username });

    socket.on('sessionPlayers', (playerList) => {
      setPlayers(playerList);
    });

    socket.on('updateReadyStatus', (readyList) => {
      setReadyUsers(readyList);
    });

    socket.on('playerLeft', (name) => {
      setPlayerLeftMsg(`${name} has left the game.`);
      setEveryoneReady(false); // <-- return to waiting page
      setReadyUsers((prev) => prev.filter((user) => user !== name));
      setPlayers((prev) => prev.filter((p) => p !== name));
    });

    socket.on('hostLeft', () => {
      setHostLeft(true); // <-- if host leaves
      setEveryoneReady(false);
    });

    return () => {
      socket.off('sessionPlayers');
      socket.off('updateReadyStatus');
      socket.off('playerLeft');
      socket.off('hostLeft');
    };
  }, [sessionId, username]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Computer Science Quiz</h2>
        <button
          onClick={handleLeave}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
        >
          Leave Session
        </button>
      </div>

      {/* If Host Left */}
      {hostLeft && (
        <div className="text-center text-red-600 font-semibold mt-8">
          <p className="text-xl mb-4">The host has left the session.</p>
          <button
            onClick={handleLeave}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Lobby
          </button>
        </div>
      )}

      {/* QuizGame loaded only if host has NOT left */}
      {!hostLeft && (
        <QuizGame
          sessionId={sessionId}
          username={username}
          players={players}
          readyUsers={readyUsers}
          setPlayers={setPlayers}
          setReadyUsers={setReadyUsers}
          hostLeft={hostLeft}
          setHostLeft={setHostLeft}
          playerLeftMsg={playerLeftMsg}
          setPlayerLeftMsg={setPlayerLeftMsg}
          handleLeave={handleLeave}
          everyoneReady={everyoneReady}
          setEveryoneReady={setEveryoneReady}
        />
        
      )}
    </div>
  );
}
