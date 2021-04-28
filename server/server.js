const mongoose = require('mongoose')
const Document = require('./Document')

mongoose.connect('mongodb://localhost/google-docs-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true
})

const io = require('socket.io')(4000, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

io.on('connection', socket => {
  console.log(`Connected from ${socket}`)

  socket.on('get-document', async documentID => {
    const document = await getDocument(documentID)

    socket.emit('load-document', document.data)

    socket.join(documentID)
    socket.on('send-changes', delta => {
      socket.broadcast.to(documentID).emit('receive-changes', delta)
    })

    socket.on('save-document', async data => {
      await Document.findByIdAndUpdate(documentID, {data: data}, {useFindAndModify: false})
    })
  })
  
})

// Function to get existing document or create document with _id = ID
async function getDocument(ID) {
  if (ID == null) return

  const document = await Document.findById(ID)

  if (document) return document

  return await Document.create({_id: ID, data: ''})
}
