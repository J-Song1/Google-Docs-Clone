import React, { useCallback } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const TextEditor = () => {
  const editorWrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    const editor = document.createElement('div')
    wrapper.innerHTML = ''
    wrapper.append(editor)
    new Quill(editor, {
      theme: 'snow'
    })
  })
  
  return (
    <div id="quill-container" ref={editorWrapperRef}>
    </div>

  )
}

export default TextEditor