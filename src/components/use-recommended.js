import { ref } from 'vue'
import { useEditor } from './use-editor'

export function useRecommended({ operation, editorRef, actionRef }) {
  const recommendedRef = ref()

  const { getBlockElById } = useEditor(editorRef)

  const hiddenAction = () => {
    actionRef.value.style.display = 'none'
  }
  const onRecommended = () => {
    const block = getBlockElById(operation.value.id)

    if (!block) {
      return
    }

    const { top, left, width, height } = block.getBoundingClientRect()

    recommendedRef.value.style.top = `${top + height}px`
    recommendedRef.value.style.left = `${left}px`
    recommendedRef.value.style.width = `${width}px`

    recommendedRef.value.style.display = 'block'
    hiddenAction()
  }

  const onCancel = () => {
    recommendedRef.value.style.display = 'none'
  }

  return {
    recommendedRef,
    onRecommended,
    onCancel
  }
}
