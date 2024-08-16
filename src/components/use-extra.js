import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCommon } from './use-common'
import { useData } from './use-data'
import { useEditor } from './use-editor'

export function useExtra({
  editorRef,
  addBlockMouseout,
  addBlockMouseover,
  dragging,
  list
}) {
  const { isEditorBlock, findEditorBlock, getEditorBlockId } = useCommon()
  const { getBlockElById } = useEditor(editorRef)

  const { findRowById } = useData({ list })

  const extraInfoRef = ref()
  const maybeCursorId = ref('')
  const showExtraInfo = ref({
    visible: false,
    id: ''
  })

  const extraInfoVisible = computed(() => {
    if (dragging.value) {
      return false
    }

    const row = findRowById(showExtraInfo.value.id)

    if (!row || !row.info) {
      return false
    }

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
      id
    }

    extraInfoRef.value.style.top = `${top + height}px`
    extraInfoRef.value.style.left = `${left}px`
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
    extraInfoVisible,
    extraInfoRef
  }
}
