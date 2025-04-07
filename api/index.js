const express = require('express')
const { createServer} = require('node:http')
const { Server } = require('socket.io')
const cors = require('cors')
const app = express()
//get us set up bypass for CORS
app.use(cors())

const { Server } = require('socket.io')
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods:['GET', 'POST'],
    },
})

io.on('connection', socket => {
    socket.on('userJoin', userName => {
    console.log(userName, ' just joined')
    //validation
    users.push(userName)
    //for quick access of user detail information
    userMap[userName] = {}
})
//see updates below
socket.on('request_to_listEvents', () => {
    socket.emit('response_for_listEvents', events)
 })
}
);