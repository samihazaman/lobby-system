import { useState, useEffect } from 'react';
import { socket } from '../main';
import Leaderboard from './Leaderboard';

export default function QuizGame({ sessionId, username, players, readyUsers, setPlayers, setReadyUsers, hostLeft, setHostLeft, playerLeftMsg, setPlayerLeftMsg, handleLeave, everyoneReady, setEveryoneReady }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showResults, setShowResults] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);
  const [sessionScores, setSessionScores] = useState([]);

  const handleReady = () => {
    setIsReady(true);
    socket.emit('playerReady', sessionId);
  };

  useEffect(() => {
    socket.on('startQuiz', (fetchedQuestions) => {
      const withShuffledAnswers = fetchedQuestions.map(shuffleAnswers);
      setQuestions(withShuffledAnswers);
      setShowCountdown(true);

      let count = 3;
      setCountdown(count);

      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else if (count === 0) {
          setCountdown("Start!");
        } else if (count === -1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setEveryoneReady(true);
        }
      }, 1000);
    });

    socket.on('sessionScores', (scores) => {
      setSessionScores(scores);
    });

    return () => {
      socket.off('startQuiz');
      socket.off('sessionScores');
    };
  }, [sessionId]);

  useEffect(() => {
    if (everyoneReady) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev > 0) {
            return prev - 1;
          } else {
            clearInterval(timer);
            if (!showResults) {
              setShowResults(true);
              socket.emit('submitScore', { sessionId, username, score });
            }
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [everyoneReady, showResults, sessionId, username, score]);

  const shuffleAnswers = (question) => {
    const allAnswers = [...question.incorrect_answers, question.correct_answer];
    return { ...question, allAnswers: allAnswers.sort(() => Math.random() - 0.5) };
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
      <div key={player} className="border p-4 rounded-xl shadow-md bg-white text-center">
        <p className="font-bold text-indigo-600 mb-2">{player}</p>
        <button
          disabled
          className={`w-full px-4 py-2 rounded-lg mb-2 ${
            isPlayerReady ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
          }`}
        >
          {isPlayerReady ? 'Ready' : 'Waiting...'}
        </button>
        {isSelf && !isReady && !everyoneReady && (
          <button
            onClick={handleReady}
            className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
          >
            I'm Ready
          </button>
        )}
      </div>
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-gradient-to-tr from-indigo-100 to-sky-100 min-h-screen p-8 rounded-xl">
      {/* Host Left */}
      {hostLeft && (
        <div className="text-center text-red-600 font-semibold mt-8">
          <p className="text-2xl mb-4">The host has left the session.</p>
          <button
            onClick={handleLeave}
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Go to Lobby
          </button>
        </div>
      )}

      {/* Player Left */}
      {playerLeftMsg && !everyoneReady && (
        <div className="text-center text-yellow-600 font-medium mb-6 text-lg">{playerLeftMsg}</div>
      )}

      {/* Waiting for Players */}
      {!everyoneReady && !hostLeft && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player) => renderPlayerBox(player))}
        </div>
      )}

      {/* Countdown */}
      {showCountdown && (
        <div className="text-center mt-10 text-6xl font-bold text-indigo-600 animate-bounce">{countdown}</div>
      )}

      {/* Quiz Active */}
      {everyoneReady && !showResults && questions.length > 0 && (
        <div className="bg-white rounded-xl p-8 shadow-lg mt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="text-lg font-semibold text-indigo-600">Time Left: {formatTime(timeLeft)}</div>
            <div className="text-lg font-semibold text-indigo-600">Score: {score}</div>
          </div>

          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            Q{currentIndex + 1}: {questions[currentIndex].question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[currentIndex].allAnswers.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(choice)}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold py-3 px-6 rounded-lg transition"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold text-indigo-600 mb-4">Quiz Over!</h2>
          <p className="text-xl text-gray-700 mb-8">Your Score: {score}/10</p>
          {sessionScores.length > 0 && <Leaderboard scores={sessionScores} />}
          <button
            onClick={handleLeave}
            className="mt-8 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition"
          >
            Leave Session
          </button>
        </div>
      )}
    </div>
  );
}
