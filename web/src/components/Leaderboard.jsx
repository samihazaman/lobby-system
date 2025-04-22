
export default function Leaderboard({ scores }) {
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  
    return (
      <div className="mt-6 text-center">
        <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
        <div className="max-w-md mx-auto bg-white rounded shadow p-4">
          {sortedScores.map((entry, index) => (
            <div key={index} className="flex justify-between py-2 border-b last:border-0">
              <span className="font-medium">{entry.username}</span>
              <span className="text-blue-600 font-semibold">{entry.score}/10</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  