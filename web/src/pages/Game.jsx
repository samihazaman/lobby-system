import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../main';
import useAuth from '../Auth/useAuth';

export default function Game() {
  const { sessionId } = useParams();
  const username = useAuth();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [readyUsers, setReadyUsers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [everyoneReady, setEveryoneReady] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showResults, setShowResults] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [playerLeftMsg, setPlayerLeftMsg] = useState('');
  const [hostLeft, setHostLeft] = useState(false);

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
      setEveryoneReady(false);
      setShowCountdown(false);
      setReadyUsers((prev) => prev.filter((user) => user !== name));
      setPlayers((prev) => prev.filter((p) => p !== name));
    });

    socket.on('hostLeft', () => {
      setHostLeft(true);
      setEveryoneReady(false);
      setShowCountdown(false);
    });


    socket.on('startQuiz', (fetchedQuestions) => {
      const withShuffledAnswers = fetchedQuestions.map(shuffleAnswers);
      setQuestions(withShuffledAnswers); 
      setShowCountdown(true);
    
      // Countdown timer
      let count = 3;
      setCountdown(count);

      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        }

        if(count === 0){
          setCountdown("Start!");
        }

        if(count === -1){
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setEveryoneReady(true);
        }

      }, 1000);
    });
        
    return () => {
      socket.off('sessionPlayers');
      socket.off('updateReadyStatus');
      socket.off('startQuiz');
      socket.off('hostLeft');
      socket.off('playerLeft');
    };
  }, [sessionId, username]);

  useEffect(() => {
    if (everyoneReady && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [everyoneReady, timeLeft]);

  const handleReady = () => {
    setIsReady(true);
    socket.emit('playerReady', sessionId);
  };

  const shuffleAnswers = (question) => {
    const allAnswers = [...question.incorrect_answers, question.correct_answer];
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);
    return { ...question, allAnswers: shuffled };
  };
  

  const handleAnswer = (selected) => {
    const correct = questions[currentIndex].correct_answer;
    if (selected === correct) {
      setScore((prev) => prev + 1);
    }
    if (currentIndex < 9) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
      socket.emit('submitScore', { sessionId, username, score });
    }
  };

  const renderPlayerBox = (player) => {
    const isPlayerReady = readyUsers.includes(player);
    const isSelf = player === username;

    return (
      <div key={player} className="border p-4 rounded shadow text-center">
        <p className="font-bold mb-2">{player}</p>
        <button
          disabled
          className={`w-full px-4 py-2 rounded mb-2 ${
            isPlayerReady ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          {isPlayerReady ? 'Ready' : 'Waiting...'}
        </button>
        {isSelf && !isReady && !everyoneReady && (
          <button
            onClick={handleReady}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            I'm Ready
          </button>
        )}
      </div>
    );
  };

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

      {hostLeft && (
        <div className="text-center text-red-600 font-semibold mt-8">
          <p className="text-xl mb-4">The host has left the session.</p>
          <button
            onClick={() => navigate('/lobby')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            Go to Lobby
          </button>
        </div>
      )}

      {playerLeftMsg && !everyoneReady && (
        <div className="text-center text-yellow-600 font-medium mb-4">{playerLeftMsg}</div>
      )}

      {!everyoneReady && !hostLeft && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {players.map((player) => renderPlayerBox(player))}
        </div>
      )}

      {showCountdown && (
        <div className="text-center mt-10 text-6xl font-bold text-blue-600">{countdown}</div>
      )}

      {everyoneReady && !showResults && questions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-medium">Time Left: {timeLeft}s</div>
            <div className="text-xl font-medium">Your Score: {score}</div>
          </div>

          <h3 className="text-xl font-semibold mb-2">
            Q{currentIndex + 1}: {questions[currentIndex].question}
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {questions[currentIndex].allAnswers.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(choice)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && (
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold mb-2">Quiz Over!</h2>
          <p className="text-lg">Your Score: {score}/10</p>
          <button
            onClick={() => navigate('/lobby')}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Leave Session
          </button>
        </div>
      )}
    </div>
  );
}
