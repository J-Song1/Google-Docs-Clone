import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io } from 'socket.io-client'

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"]
]

function TextEditor() {
  const { id: documentID } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()

  // Reference for editor wrapper
  const editorWrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    const editor = document.createElement('div')
    wrapper.innerHTML = ''
    wrapper.append(editor)

    const newQuill = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS
      }
    })
    setQuill(newQuill)
    newQuill.disable()
  }, [])

  // Connecting to SocketIO
  useEffect(() => {
    const newSocket = io('http://localhost:4000')
    setSocket(newSocket)

    return newSocket.disconnect
  }, [])

  // Retrieving document from DB
  useEffect(() => {
    if (socket == null || quill == null) return
    
    socket.emit('get-document', documentID)

    socket.once('load-document', document => {
      quill.setContents(document)
      quill.enable()
    })
  }, [socket, quill, documentID])

  // Setting up save intervals
  useEffect(() => {
    if (socket == null || quill == null) return

    const saveInterval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(saveInterval)
    }
  }, [socket, quill])

  // Setting up text change receiver for quill
  useEffect(() => {
    if (socket == null || quill == null) return

    const updateHandler = (delta) => {
      quill.updateContents(delta)
    }

    socket.on('receive-changes', updateHandler)

    return () => {
      socket.off('receive-changes', updateHandler)
    }
  }, [socket, quill])
  
  // Setting up text change emitter for quill
  useEffect(() => {
    if (socket == null || quill == null) return

    const changeHandler = (delta, oldDelta, source) => {
      if (source !== 'user') return

      socket.emit('send-changes', delta)
    }

    quill.on('text-change', changeHandler)
    return () => {
      quill.off('text-change', changeHandler)
    }
  }, [socket, quill])
 
  return (
    <div id="container" ref={editorWrapperRef}>
    </div>
  )
}

export default TextEditor