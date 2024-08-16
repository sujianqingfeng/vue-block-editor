import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import { useCommon } from './use-common'
import { useEditor } from './use-editor'

function createInsertPlaceholder() {
  const div = document.createElement('div')
  div.style.height = '4px'
  div.style.width = '100%'
  div.style.position = 'absolute'
  div.style.backgroundColor = '#eee'
  return div
}

export function useDrag({ editorRef, addBlockMouseout, addBlockMouseover }) {
  const { getEditorBlockId, isEditorBlock, getBlockTypeByAction } = useCommon()
  const { getBlockElById } = useEditor(editorRef)

  const dragContentRef = ref()
  const operationRef = ref()
  const actionRef = ref()
  const dragRef = ref(null)
  const dragging = ref(false)
  const operationShow = ref(false)
  const operation = ref({
    visible: false,
    top: 0,
    left: 0
  })

  const insertPlaceholderDiv = createInsertPlaceholder()
  let timer = null

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

    operationRef.value.style.top = `${top}px`
    operationRef.value.style.left = `${left - 50}px`

    operation.value = {
      visible: true,
      id
    }
  }

  const onBlockMouseout = async () => {
    timer = setTimeout(() => {
      operation.value.visible = false
    }, 500)
  }

  const removeDragContent = () => {
    const children = dragContentRef.value.children
    if (children.length) {
      dragContentRef.value.removeChild(children[0])
    }
  }

  const onDragMousedown = (e) => {
    e.preventDefault()

    const initialX = e.clientX
    const initialY = e.clientY

    const dragRect = dragRef.value.getBoundingClientRect()
    const { top, height, left, width } = dragRect

    const dragContentTop = top + height - 10
    const dragContentLeft = left + width - 10

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
      actionRef.value.style.display = 'none'
      editorRef.value.style['user-select'] = 'none'

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
      dragging.value = false
      editorRef.value.style['user-select'] = 'auto'

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

  const onDragMouseup = (e) => {
    const dragRect = dragRef.value.getBoundingClientRect()
    const { top, left, height } = dragRect

    actionRef.value.style.top = `${top + height + 8}px`
    actionRef.value.style.left = `${left - 100}px`
    actionRef.value.style.display = 'block'
  }

  const hiddenAction = () => {
    actionRef.value.style.display = 'none'
  }

  onClickOutside(actionRef, hiddenAction, {
    ignore: [dragRef]
  })

  const onAction = (action) => {
    const id = operation.value.id

    const block = getBlockElById(id)
    if (!block) {
      return
    }

    block.dataset.type = getBlockTypeByAction(action)
    hiddenAction()
  }

  const onOperationMouseover = () => {
    if (timer) {
      clearTimeout(timer)
    }
    operationShow.value = true
  }

  const onOperationMouseout = () => {
    timer = setTimeout(() => {
      operationShow.value = false
      operation.value.visible = false
    }, 500)
  }

  addBlockMouseover(onBlockMouseover)
  addBlockMouseout(onBlockMouseout)

  return {
    operation,
    operationRef,
    dragRef,
    dragContentRef,
    dragging,
    actionRef,
    onAction,
    onDragMouseup,
    onDragMousedown,
    onOperationMouseover,
    onOperationMouseout
  }
}
