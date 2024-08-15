import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCommon } from './use-common'
import { useEditor } from './use-editor'

export function useExtra({ editorRef, addBlockMouseout, addBlockMouseover }) {
  const { isEditorBlock, findEditorBlock, getEditorBlockId } = useCommon()

  const { getBlockElById } = useEditor(editorRef)
  const maybeCursorId = ref('')
  const showExtraInfo = ref({
    visible: false,
    index: 0,
    top: 0,
    left: 0
  })

  const showExtraInfoStyle = computed(() => {
    return {
      top: `${showExtraInfo.value.top}px`,
      left: `${showExtraInfo.value.left}px`
    }
  })

  const extraInfoVisible = computed(() => {
    const id = maybeCursorId.value
    let isApproaching = true
    if (id) {
      const currentCursor = getBlockElById(id)
      if (currentCursor) {
        const previousSibling = currentCursor.previousSibling
        if (isEditorBlock(previousSibling)) {
          const previousId = getEditorBlockId(previousSibling)
          isApproaching = !(previousId === showExtraInfo.value.id)
        }
      }
    }

    return (
      showExtraInfo.value.visible &&
      maybeCursorId.value !== showExtraInfo.value.id &&
      isApproaching
    )
  })

  const onBlockMouseover = (target) => {
    const { height, left, top } = target.getBoundingClientRect()
    const id = getEditorBlockId(target)

    showExtraInfo.value = {
      visible: true,
      left,
      top: top + height,
      id
    }
  }

  const onBlockMouseout = () => {
    showExtraInfo.value.visible = false
  }

  function onSelectionChange() {
    const selection = window.getSelection()
    const len = selection.toString().length
    if (len) {
      return
    }
    const anchorNode = selection.anchorNode

    const block = findEditorBlock(anchorNode)
    if (!block) {
      return
    }

    const id = getEditorBlockId(block)
    maybeCursorId.value = id
  }

  onMounted(() => {
    document.addEventListener('selectionchange', onSelectionChange)
  })

  onUnmounted(() => {
    document.removeEventListener('selectionchange', onSelectionChange)
  })

  addBlockMouseout(onBlockMouseout)
  addBlockMouseover(onBlockMouseover)

  return {
    showExtraInfoStyle,
    extraInfoVisible
  }
}
