import useAuth from '../Auth/useAuth';

export default function Leaderboard({ scores }) {
  const username = useAuth(); //current logged-in player

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="mt-10 text-center">
      <h3 className="text-3xl font-bold text-indigo-600 mb-6">🏆 Leaderboard</h3>

      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
        {sortedScores.length === 0 ? (
          <p className="text-gray-400">No scores yet.</p>
        ) : (
          sortedScores.map((entry, index) => (
            <div
              key={index}
              className={`flex justify-between items-center py-3 px-4 mb-2 rounded-lg ${
                entry.username === username
                  ? 'bg-indigo-100 text-indigo-700 font-bold'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{index + 1}.</span>
                <span>{entry.username}</span>
              </div>
              <span className="text-lg">{entry.score}/10</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
