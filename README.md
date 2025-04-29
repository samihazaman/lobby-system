# QuizVerse - Multiplayer Quiz Game

Welcome to **QuizVerse** — a **real-time multiplayer quiz application** where players can create or join quiz events, challenge friends, and race against time to answer questions correctly!

## Features

- 🧠 **Computer Science Quizzes** available (more can be added easily!)
- 🎮 **Create or Join Live Events** with a simple event selection in the lobby
- 🚥 **Real-time player ready states** and **dynamic waiting rooms**
- 🥇 **Leaderboard** with ranks and player score
- ✅ Immediate **answer feedback**
- 📱 **Responsive design** for desktops and tablets
- 🎨 **Modern UI/UX** with consistent color themes across login, lobby, and game

---

## Technologies Used

| Technology            | Purpose                                          |
|------------------------|--------------------------------------------------|
| **React.js**           | Frontend UI components and routing               |
| **Socket.IO**          | Real-time multiplayer communication (WebSockets) |
| **Express.js**         | Backend server handling socket events            |
| **Tailwind CSS**       | Modern styling and responsive layouts            |
| **Vite**               | React development environment                    |
| **Node.js**            | Server runtime environment                       |
| **Open Trivia DB API** | Fetching real quiz questions dynamically         |

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lobby-system.git
cd lobby-system
```

### 2. Move into the project directory

```bash
cd lobby-system

# Install server dependencies
cd api
npm install

# Install client dependencies
cd web
npm install
```

### 3. Start the Application

```bash
# In one terminal, start the backend server
cd api
nodemon start

# In the new terminal, start the frontend client
cd web
npm run dev
```

### 4. Start the Application

```bash
# Open your browser and visit:
  http://localhost:5173

The server runs at http://localhost:3000, and the frontend at http://localhost:5173.
```
