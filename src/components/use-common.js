export function useCommon() {
  function isEditorBlock(target) {
    if (!target) {
      return false
    }
    return target.classList && target.classList.contains('editor-block')
  }

  function isEditorRoot(target) {
    if (!target) {
      return false
    }
    return target.classList && target.classList.contains('editor-root')
  }

  function findEditorBlock(target) {
    while (target) {
      if (isEditorRoot(target)) {
        return null
      }

      if (isEditorBlock(target)) {
        return target
      }
      target = target.parentNode
    }
  }

  function getEditorBlockId(target) {
    const id = target.dataset.id || ''
    return id
  }

  return {
    findEditorBlock,
    isEditorBlock,
    isEditorRoot,
    getEditorBlockId
  }
}
