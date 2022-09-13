const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const users = []

app.use('/', express.static(__dirname + '/public'))

server.listen(process.env.PORT || 4000)

io.on('connection', socket => {
    console.log("New client connected")
    //new user login
    socket.on('login', data => {
        console.log(data)
        if (users.indexOf(data.nickname) > -1) {
            socket.emit('nickExisted')
        } else {
            //socket.userIndex = users.length
            socket.nickname = data.nickname
            users.push(data.nickname)
            socket.emit('loginSuccess', {nickname: data.nickname})
            io.sockets.emit('system', {nickname: data.nickname, total:users.length, type: 'login'})
        }
    })
    //user leaves
    socket.on('disconnect', () => {
        if (socket.nickname != null) {
            //users.splice(socket.userIndex, 1)
            users.splice(users.indexOf(socket.nickname), 1)
            socket.broadcast.emit('system', {nickname: socket.nickname,total : users.length, type: 'logout'})
        }
    })
    //new message get
    socket.on('chatMessageFromBrowser', data => {
        console.log("New message arrived")
        console.log(data)
        socket.broadcast.emit('chatMessageFromServer', {username : socket.nickname, message: data.message})
    })
    
})