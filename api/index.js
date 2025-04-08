const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

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

io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.emit('activeEvents', Object.values(events));

  socket.on('createEvent', ({ eventId, username }) => {
    events[eventId] = {
      eventId,
      host: username,
      players: [username],
    };

    io.emit('activeEvents', Object.values(events)); 
  });



  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
