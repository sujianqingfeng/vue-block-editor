import { useCommon } from './use-common'

let count = -100

export function useRootKeydown(editorRef) {
  const { findEditorBlock, getBlockTypeByAction } = useCommon()

  function onRootKeydown(e) {
    const { key } = e
    if (key === 'Enter') {
      e.preventDefault()
      const range = window.getSelection().getRangeAt(0)

      const block = findEditorBlock(range.endContainer)

      if (!block) {
        return
      }

      const textContent = range.startContainer.textContent
      const offset = range.endOffset

      const textBefore = textContent.slice(0, offset)
      const textAfter = textContent.slice(offset)

      range.startContainer.textContent = textBefore

      const newLine = document.createElement('div')
      newLine.textContent = textAfter || ''
      newLine.className = 'editor-block'
      newLine.dataset.id = count--
      newLine.dataset.type = getBlockTypeByAction(0)

      editorRef.value.insertBefore(newLine, block.nextSibling)

      const newRange = document.createRange()
      const selection = window.getSelection()
      newRange.setStart(newLine, 0)
      newRange.setEnd(newLine, 0)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  }

  return {
    onRootKeydown
  }
}
