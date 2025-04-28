const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
/*const fetch = require('node-fetch'); */
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const server = http.createServer(app);

const socketToSession = {}; // track which session a socket is in
const socketToUsername = {}; // track username for each socket


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

  socket.on('createEvent', ({ eventId, username, eventName }) => {
    events[eventId] = {
      eventId,
      host: username,
      eventName,
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
    socketToSession[socket.id] = sessionId;
    socketToUsername[socket.id] = username;  

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


  socket.on('leaveRoom', ({ sessionId, username }) => {
    if (!events[sessionId]) return;
  
    const isHost = events[sessionId].host === username;
    socket.leave(sessionId);
  
    if (isHost) {
      // End session for all
      io.to(sessionId).emit('hostLeft');
      delete events[sessionId];
      delete playerReadyStatus[sessionId];
      delete playerScores[sessionId];
    } else {

      // Remove player and notify others
      events[sessionId].players = events[sessionId].players.filter(p => p !== username);
      playerReadyStatus[sessionId] = playerReadyStatus[sessionId]?.filter(p => p !== username);
      io.to(sessionId).emit('sessionPlayers', events[sessionId].players);
      io.to(sessionId).emit('playerLeft', username);
    }
  
    delete socketToSession[socket.id];
    delete socketToUsername[socket.id];
  });
  
  

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const sessionId = socketToSession[socket.id];
    const username = socketToUsername[socket.id];
    if (!sessionId || !events[sessionId]) return;
  
    const isHost = events[sessionId].host === username;
    socket.leave(sessionId);
  
    if (isHost) {
      io.to(sessionId).emit('hostLeft');
      delete events[sessionId];
      delete playerReadyStatus[sessionId];
      delete playerScores[sessionId];
    } else {
      events[sessionId].players = events[sessionId].players.filter(p => p !== username);
      playerReadyStatus[sessionId] = playerReadyStatus[sessionId]?.filter(p => p !== username);
      io.to(sessionId).emit('sessionPlayers', events[sessionId].players);
      io.to(sessionId).emit('playerLeft', username);
    }
  
    delete socketToSession[socket.id];
    delete socketToUsername[socket.id];
  });
  



});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
