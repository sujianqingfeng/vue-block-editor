import { ref, computed } from 'vue'
import { useCommon } from './use-common'
import { useEditor } from './use-editor'

export function useDrag({ editorRef, addBlockMouseout, addBlockMouseover }) {
  const { getEditorBlockId, isEditorBlock } = useCommon()
  const { getBlockElById } = useEditor(editorRef)

  const operationRef = ref(null)
  const dragRef = ref(null)
  const dragging = ref(false)

  const operation = ref({
    visible: false
  })

  const operationStyle = computed(() => {
    return {
      top: `${operation.value.top}px`,
      left: `${operation.value.left}px`
    }
  })

  const onBlockMouseover = (target) => {
    const { left, top } = target.getBoundingClientRect()
    console.log('🚀 ~ onBlockMouseover ~ left:', left)
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
    // console.log('🚀 ~ onBlockRootDragover ~ e:', e)
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  addBlockMouseover(onBlockMouseover)
  addBlockMouseout(onBlockMouseout)

  return {
    operation,
    operationStyle,
    operationRef,
    dragRef,
    dragging,
    onDragStart,
    onDragEnd,
    onBlockRootDragover,
    onBlockRootDrop
  }
}
