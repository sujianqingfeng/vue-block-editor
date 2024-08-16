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

  function getBlockTypeByAction(action) {
    const types = {
      0: 'paragraph',
      1: 'heading1',
      2: 'heading2'
    }
    return types[action]
  }

  return {
    findEditorBlock,
    isEditorBlock,
    isEditorRoot,
    getEditorBlockId,
    getBlockTypeByAction
  }
}
