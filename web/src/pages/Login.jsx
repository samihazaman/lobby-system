import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Auth/AuthProvider';
import loginIllustration from '../assets/login_question_graphic.svg';
import loginSetupGraphic from '../assets/login_quiz_graphic.svg';
import quizLogo from '../assets/quiz_logo.png';


export default function Login() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) {
      login(trimmed);
      navigate('/lobby');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-tr from-indigo-100 to-sky-100 overflow-hidden">
      
      {/* Top-left setup illustration */}
      <img
        src={loginSetupGraphic}
        alt="Setup Graphic"
        className="absolute top-0 left-10 w-[340px] hidden md:block opacity-50 pointer-events-none"
      />

      {/* Bottom-right question illustration */}
      <img
        src={loginIllustration}
        alt="Quiz Illustration"
        className="absolute right-0 bottom-0 w-[400px] hidden md:block opacity-30 pointer-events-none"
      />

      {/* Login box */}
      <div className="relative z-10 bg-white p-12 md:p-16 rounded-2xl shadow-2xl w-full max-w-2xl animate-fadeIn">
        <div className="text-center mb-8">
          <img
            src={quizLogo}
            alt="Quiz Icon"
            className="w-24 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">QuizVerse</h1>
          <p className="text-slate-600 text-lg">Where curiosity meets competition!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-slate-400"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 text-lg rounded-lg hover:bg-indigo-700 transition"
          >
            Enter Lobby
          </button>
        </form>
      </div>
    </div>
  );
}
