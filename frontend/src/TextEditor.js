import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io } from 'socket.io-client'

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
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()

  useEffect(() => {
    const newSocket = io('http://localhost:4000')

    setSocket(newSocket)
    return () => {
      newSocket.disconnect()
    }
  }, [])

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
  }, [])

  // Setting up text change receiver for quill
  useEffect(() => {
    if (socket == null || quill == null) return

    const updateHandler = (delta) => {
      console.log('Here')
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