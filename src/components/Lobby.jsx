import { Link } from "react-router-dom";

function Lobby() {
  return (
    <div className="lobby">
      <h1>Welcome to the Lobby</h1>
      <p>Click below to join the game</p>
      <Link to="/game">
        <button>Start Game</button>
      </Link>
    </div>
  );
}

export default Lobby;
