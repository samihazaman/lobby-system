const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
/*const fetch = require('node-fetch'); */
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const events = {}; 
const playerReadyStatus = {};
const playerScores = {};


io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.emit('activeEvents', Object.values(events));

  socket.on('createEvent', ({ eventId, username }) => {
    events[eventId] = {
      eventId,
      host: username,
      players: [username],
    };
    socket.join(eventId);
    io.emit('activeEvents', Object.values(events)); 
  });

  socket.on('joinEvent', ({ eventId, username }) => {
    if (events[eventId] && !events[eventId].players.includes(username)) {
      events[eventId].players.push(username);
    }
    socket.join(eventId);
    io.emit('activeEvents', Object.values(events));
    io.to(eventId).emit('sessionPlayers', events[eventId].players);
  });



  socket.on('joinRoom', ({ sessionId, username }) => {
    socket.join(sessionId);
    socket.username = username;

    if (!events[sessionId]) {
      events[sessionId] = {
        eventId: sessionId,
        host: username,
        players: [],
      };
    }

    if (!events[sessionId].players.includes(username)) {
      events[sessionId].players.push(username);
    }

    //players in the session quiz page
    io.to(sessionId).emit('sessionPlayers', events[sessionId].players);
  });

  socket.on('playerReady', async (sessionId) => {
    if (!playerReadyStatus[sessionId]) playerReadyStatus[sessionId] = [];

    const event = events[sessionId];
    if (!event || !event.players) return;

    const playerName = socket.username;
    if (playerName && !playerReadyStatus[sessionId].includes(playerName)) {
      playerReadyStatus[sessionId].push(playerName);
    }

    io.to(sessionId).emit('updateReadyStatus', playerReadyStatus[sessionId]);

    //start quiz when players are ready
    if (playerReadyStatus[sessionId].length === event.players.length) {
      const res = await fetch('https://opentdb.com/api.php?amount=10&category=18&type=multiple');
      const data = await res.json();
      io.to(sessionId).emit('startQuiz', data.results);
    }
  });
      
  socket.on('submitScore', ({ sessionId, username, score }) => {
    if (!playerScores[sessionId]) playerScores[sessionId] = [];
    playerScores[sessionId].push({ username, score });

    io.to(sessionId).emit('sessionScores', playerScores[sessionId]);
  });



  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
