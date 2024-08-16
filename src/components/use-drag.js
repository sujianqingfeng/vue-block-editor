import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCommon } from './use-common'
import { useEditor } from './use-editor'

function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function createInsertPlaceholder() {
  const div = document.createElement('div')
  div.style.height = '4px'
  div.style.width = '100%'
  div.style.backgroundColor = '#eee'
  return div
}

export function useDrag({ editorRef, addBlockMouseout, addBlockMouseover }) {
  const { getEditorBlockId, isEditorBlock } = useCommon()
  const { getBlockElById } = useEditor(editorRef)

  const dragContentRef = ref(null)
  const operationRef = ref(null)
  const dragRef = ref(null)
  const dragging = ref(false)
  const operationShow = ref(false)
  let timer = null

  const operation = ref({
    visible: false,
    top: 0,
    left: 0
  })

  const operationStyle = computed(() => {
    return {
      top: `${operation.value.top}px`,
      left: `${operation.value.left}px`
    }
  })

  const onBlockMouseover = (target) => {
    if (dragging.value) {
      return
    }

    if (timer) {
      clearTimeout(timer)
    }

    const rect = target.getBoundingClientRect()

    const { left, top } = rect
    const id = getEditorBlockId(target)

    operation.value = {
      visible: true,
      left: left - 30,
      top: top,
      id
    }
  }

  const onBlockMouseout = async () => {
    timer = setTimeout(() => {
      if (operationShow.value) {
        return
      }
      operation.value.visible = false
    }, 1000)
  }

  const removeDragContent = () => {
    const children = dragContentRef.value.children
    if (children.length) {
      dragContentRef.value.removeChild(children[0])
    }
  }

  const onDragMousedown = (e) => {
    console.log('🚀 ~ onDragMousedown ~ e:', e)
    e.preventDefault()

    const initialX = e.clientX
    const initialY = e.clientY

    const dragRect = dragRef.value.getBoundingClientRect()
    const { top, height, left, width } = dragRect

    const dragContentTop = top + height - 10
    const dragContentLeft = left + width - 10

    const insertPlaceholderDiv = createInsertPlaceholder()

    const removeInsertPlaceholder = () => {
      if (insertPlaceholderDiv.parentNode) {
        insertPlaceholderDiv.parentNode.removeChild(insertPlaceholderDiv)
      }
    }

    const onMoveHandler = (e) => {
      if (!dragging.value) {
        const block = getBlockElById(operation.value.id)
        const cloneBlock = block.cloneNode(true)
        dragContentRef.value.appendChild(cloneBlock)
      }

      dragging.value = true

      const { clientX, clientY } = e
      const deltaX = clientX - initialX
      const deltaY = clientY - initialY

      dragContentRef.value.style.top = `${dragContentTop + deltaY}px`
      dragContentRef.value.style.left = `${dragContentLeft + deltaX}px`

      const target = document.elementFromPoint(clientX, clientY)

      if (!isEditorBlock(target)) {
        removeInsertPlaceholder()
        return
      }

      editorRef.value.insertBefore(insertPlaceholderDiv, target)
    }

    const onUpHandler = (e) => {
      console.log('🚀 ~ onUpHandler ~ e:', e)
      dragging.value = false

      const remove = () => {
        removeInsertPlaceholder()
        removeDragContent()
        document.removeEventListener('mousemove', onMoveHandler)
        document.removeEventListener('mouseup', onUpHandler)
      }

      const { clientX, clientY } = e
      const target = document.elementFromPoint(clientX, clientY)

      if (!isEditorBlock(target)) {
        remove()
        return
      }

      const sourceBlock = getBlockElById(operation.value.id)
      editorRef.value.insertBefore(sourceBlock, target)

      remove()
    }

    document.addEventListener('mousemove', onMoveHandler)
    document.addEventListener('mouseup', onUpHandler)
  }

  const onOperationMouseover = () => {
    console.log('🚀 ~ onOperationMouseover ~ onOperationMouseover:')
    if (timer) {
      clearTimeout(timer)
    }

    operationShow.value = true
  }

  const onOperationMouseout = () => {
    console.log('🚀 ~ onOperationMouseout ~ onOperationMouseout:=====')
    operationShow.value = false
    operation.value.visible = false
  }

  onMounted(() => {
    dragRef.value.addEventListener('mousedown', onDragMousedown)
    operationRef.value.addEventListener('mouseover', onOperationMouseover)
    operationRef.value.addEventListener('mouseout', onOperationMouseout)
  })

  onUnmounted(() => {
    dragRef.value.removeEventListener('mousedown', onDragMousedown)
    operationRef.value.removeEventListener('mouseover', onOperationMouseover)
    operationRef.value.removeEventListener('mouseout', onOperationMouseout)
  })

  addBlockMouseover(onBlockMouseover)
  addBlockMouseout(onBlockMouseout)

  return {
    operation,
    operationStyle,
    operationRef,
    dragRef,
    dragContentRef,
    dragging,
    onDragMousedown
  }
}
