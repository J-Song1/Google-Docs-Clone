const mongoose = require('mongoose')
const Document = require('./Document')
mongoose.set('useFindAndModify', false);

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
      console.log(data)
      await Document.findByIdAndUpdate(documentID, {data: data}, {useFindAndModify: false})


      //await Document.findByIdAndUpdate(documentID, { $set: data }, { useFindAndModify: true })
    })
  })
  
})

async function getDocument(ID) {
  if (ID == null) return

  const document = await Document.findById(ID)

  console.log(document)

  if (document) return document

  return await Document.create({_id: ID, data: ''})
}
