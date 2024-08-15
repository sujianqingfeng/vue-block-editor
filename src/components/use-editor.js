export function useEditor(editorRef) {
  const getBlockElById = (id) => {
    return editorRef.value.querySelector(`[data-id="${id}"]`)
  }

  return {
    getBlockElById
  }
}
