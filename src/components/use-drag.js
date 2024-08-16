import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCommon } from './use-common'
import { useEditor } from './use-editor'

export function useDrag({ editorRef, addBlockMouseout, addBlockMouseover }) {
  const { getEditorBlockId, isEditorBlock } = useCommon()
  const { getBlockElById } = useEditor(editorRef)

  const dragContentRef = ref(null)
  const operationRef = ref(null)
  const dragRef = ref(null)
  const dragging = ref(false)

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

  const onBlockMouseout = () => {
    operation.value.visible = false
    removeDragContent()
  }

  const removeDragContent = () => {
    const children = dragRef.value.children
    if (children.length > 1) {
      dragRef.value.removeChild(children[1])
    }
  }

  const onDragStart = (e) => {
    const block = getBlockElById(operation.value.id)

    if (!block) {
      return
    }

    dragging.value = true
    const cloneBlock = block.cloneNode(true)

    block.style.opacity = 0

    removeDragContent()

    dragRef.value.appendChild(cloneBlock)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.clearData()
    e.dataTransfer.setData('text/plain', operation.value.id)
  }

  const onDragEnd = () => {
    removeDragContent()
    dragging.value = false
    const sourceBlock = getBlockElById(operation.value.id)
    if (!sourceBlock) {
      return
    }
    sourceBlock.style.opacity = 1
  }

  const onBlockRootDrop = (e) => {
    console.log('🚀 ~ onBlockRootDrop ~ e:', e)
    e.preventDefault()
    const { target } = e

    if (!isEditorBlock(target)) {
      return
    }

    const id = e.dataTransfer.getData('text/plain')
    const sourceBlock = getBlockElById(id)
    editorRef.value.insertBefore(sourceBlock, target)
  }

  const onBlockRootDragover = (e) => {
    console.log('🚀 ~ onBlockRootDragover ~ e:', e)
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
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

    const onMoveHandler = (e) => {
      console.log('🚀 ~ onMoveHandler ~ event:', e)
      dragging.value = true

      const { clientX, clientY } = e
      const deltaX = clientX - initialX
      const deltaY = clientY - initialY

      dragContentRef.value.style.top = `${dragContentTop + deltaY}px`
      dragContentRef.value.style.left = `${dragContentLeft + deltaX}px`

      const target = document.elementFromPoint(clientX, clientY)

      if (!isEditorBlock(target)) {
        return
      }

      // console.log('🚀 ~ onMoveHandler ~ target:======', target)
    }

    const onUpHandler = (e) => {
      console.log('🚀 ~ onUpHandler ~ e:', e)
      dragging.value = false

      const remove = () => {
        document.removeEventListener('mousemove', onMoveHandler)
        document.removeEventListener('mouseup', onUpHandler)
      }

      const { clientX, clientY } = e
      const target = document.elementFromPoint(clientX, clientY)
      console.log('🚀 ~ onUpHandler ~ target:', target)

      if (!isEditorBlock(target)) {
        remove()
        return
      }

      console.log('🚀 ~ onUpHandler ~ target:', target)

      const sourceBlock = getBlockElById(operation.value.id)
      console.log('🚀 ~ onUpHandler ~ sourceBlock:', sourceBlock)
      editorRef.value.insertBefore(sourceBlock, target)

      remove()
    }

    document.addEventListener('mousemove', onMoveHandler)
    document.addEventListener('mouseup', onUpHandler)
  }

  onMounted(() => {
    dragRef.value.addEventListener('mousedown', onDragMousedown)
  })

  onUnmounted(() => {
    dragRef.value.removeEventListener('mousedown', onDragMousedown)
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
    onDragStart,
    onDragEnd,
    onBlockRootDragover,
    onBlockRootDrop,
    onDragMousedown
  }
}
