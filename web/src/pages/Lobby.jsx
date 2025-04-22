import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../main'; 
import useAuth from '../Auth/useAuth';

const generateEventId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export default function Lobby() {
  const username = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('quiz');

  useEffect(() => {
    socket.on('activeEvents', (data) => {
      setEvents(data);
    });

    return () => {
      socket.off('activeEvents');
    };
  }, []);

  const handleCreateEvent = () => {
    const eventId = generateEventId();
    socket.emit('createEvent', { eventId, username });
    navigate(`/${eventId}`);
  };

  const handleJoinEvent = (eventId) => {
    socket.emit('joinEvent', { eventId, username });
    navigate(`/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-sky-100 p-8 flex flex-col md:flex-row gap-10 items-start justify-center">
      
      {/* User Info + Create */}
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-indigo-600 mb-6">Welcome, {username}!</h2>

        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Create a New Event</h3>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-400 focus:outline-none"
          >
            <option value="quiz">Quiz</option>
            <option value="tic tac toe">Tic Tac Toe</option>
          </select>
          <button
            onClick={handleCreateEvent}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Active Events */}
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-2xl">
        <h3 className="text-xl font-bold text-indigo-600 mb-6">Available Events</h3>
        {events.length === 0 ? (
          <p className="text-gray-500">No active events yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.eventId}
                className="flex items-center justify-between border border-gray-200 p-4 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">Event ID: {event.eventId}</p>
                  <p className="text-sm text-gray-500">Host: {event.host}</p>
                </div>
                <button
                  onClick={() => handleJoinEvent(event.eventId)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
