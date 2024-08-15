import { ref, computed } from 'vue'
import { useCommon } from './use-common'
import { useEditor } from './use-editor'

export function useDrag({ editorRef, addBlockMouseout, addBlockMouseover }) {
  const { getEditorBlockId } = useCommon()
  const { getBlockElById } = useEditor(editorRef)

  const operationRef = ref(null)
  const dragRef = ref(null)

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
  }

  const onDragStart = (e) => {
    console.log('🚀 ~ onDragStart ~ e:', e)

    const block = getBlockElById(operation.value.id)
    console.log('🚀 ~ onDragStart ~ block:', block)

    if (!block) {
      return
    }

    const cloneBlock = block.cloneNode(true)
    console.log('🚀 ~ onDragStart ~ cloneBlock:', cloneBlock)

    const childrenLen = dragRef.value.children.length
    if (childrenLen > 1) {
      dragRef.value.removeChild(dragRef.value.children[1])
    }

    dragRef.value.appendChild(cloneBlock)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onBlockRootDrop = (e) => {
    console.log('🚀 ~ onBlockRootDrop ~ e:', e)
  }

  const onBlockRootDragover = (e) => {
    console.log('🚀 ~ onBlockRootDragover ~ e:', e)
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
    onDragStart,
    onBlockRootDragover,
    onBlockRootDrop
  }
}

function onDragStart(e, index) {
  console.log('🚀 ~ onDragStart ~ e:', e, index)

  const { pageX, pageY } = e

  const element = document.elementFromPoint(pageX, pageY)
  if (!element.classList.contains('drag-handle')) {
    e.preventDefault()
    return
  }

  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', index)
}

function onDragover(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  console.log('🚀 ~ onDragover ~ e:', e)
}

function onDragleave(e) {
  console.log('🚀 ~ onDragleave ~ e:', e)
}

function onDrop(e, targetIndex) {
  e.preventDefault()
  // console.log('🚀 ~ onDrag ~ e:', e)
  const sourceIndex = +e.dataTransfer.getData('text/plain')
  console.log('🚀 ~ onDrag ~ data:', sourceIndex)
  console.log('🚀 ~ onDrop ~ targetIndex:', targetIndex)

  const source = list.value[sourceIndex]
  console.log('🚀 ~ onDrop ~ source:', source)
  const target = list.value[targetIndex]

  list.value[sourceIndex] = target
  list.value[targetIndex] = source
}
