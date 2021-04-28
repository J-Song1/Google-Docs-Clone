const io = require('socket.io')(4000, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

io.on('connection', socket => {
  console.log(`Connected from ${socket}`)

  socket.on('send-changes', delta => {
    socket.broadcast.emit('receive-changes', delta)
  })
})
