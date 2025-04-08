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


  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">


      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Your Info</h2>
        <p>Username: {username}</p>

        <h2 className="text-lg font-semibold mt-6 mb-2">Create Event</h2>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full mb-2 border rounded px-2 py-1"
        >
          <option value="quiz">Quiz</option>
          <option value="tic tac toe">Tic tac toe</option>
        </select>
        <button
          onClick={handleCreateEvent}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Event
        </button>
      </div>



      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Available Events</h2>
        {events.length === 0 ? (
          <p>No active events yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.eventId} className="mb-4 flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Event: {event.eventId}</p>
                <p>Host: {event.host}</p>
              </div>
        
            </div>
          ))
        )}
      </div>
    </div>
  );
}
