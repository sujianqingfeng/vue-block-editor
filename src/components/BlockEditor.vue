<script setup>
import { useThrottleFn } from '@vueuse/core'
import { GripVertical } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const mock = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  type: 0,
  content: `content ${i}`,
  hasInfo: true
}))

const list = ref(mock)

const editorRef = ref()

const showInfo = ref({
  visible: false,
  index: 0,
  top: 0,
  left: 0
})

const showInfoStyle = computed(() => {
  return {
    top: `${showInfo.value.top}px`,
    left: `${showInfo.value.left}px`
  }
})

const judgeEditorContent = (target) => {
  if (!target) {
    return false
  }

  const { type } = target.dataset || {}

  if (type !== 'content') {
    return false
  }

  return true
}

const getTargetIndexFromDataset = (target) => {
  return Number(target.dataset.index)
}

const getCurrentRowData = (index) => {
  return list.value[index]
}

function logSelection() {
  const selection = window.getSelection()
  const len = selection.toString().length
  if (len) {
    return
  }
  const parentNode = selection.anchorNode.parentNode
  // console.log('🚀 ~ logSelection ~ selection:', parentNode)
  // if (
  //   selection.rangeCount > 0 &&
  //   selection.anchorNode.parentNode === editorRef.value
  // ) {
  //   const range = selection.getRangeAt(0)
  //   const rect = range.getBoundingClientRect()
  //   console.log('Selection start offset:', range.startOffset)
  //   console.log('Selection end offset:', range.endOffset)
  //   console.log('Selection bounding rect:', rect)
  // } else {
  //   console.log('No selection')
  // }

  const isEditorContent = judgeEditorContent(parentNode)
  if (!isEditorContent) {
    return
  }
  const index = getTargetIndexFromDataset(parentNode)
  // const row = getCurrentRowData(index)
  // console.log('🚀 ~ logSelection ~ id:', row)
  list.value[index].focus = true
}

function getEditorContentItemRoot(target) {
  while (target) {
    if (judgeEditorContent(target)) {
      return target
    }
    target = target.parentNode
  }
}

function onEnter(e) {
  e.preventDefault()

  const selection = window.getSelection()
  if (selection.rangeCount === 0) {
    return
  }

  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(e.target)

  preCaretRange.setEnd(range.endContainer, range.endOffset)

  const cursorPosition = preCaretRange.toString().length

  const itemTarget = getEditorContentItemRoot(range.endContainer.parentNode)
  console.log('🚀 ~ onEnter ~ itemTarget:', itemTarget)

  if (!itemTarget) {
    return
  }
  const index = getTargetIndexFromDataset(itemTarget)
  console.log('🚀 ~ onEnter ~ index:', index)

  list.value.splice(index + 1, 0, {
    id: list.value.length,
    type: 0,
    content: 'fffff',
    hasInfo: true
  })

  console.log('Cursor Position:', cursorPosition)
}

const onMouseover = ({ target }) => {
  const selection = window.getSelection()
  const len = selection.toString().length
  if (len) {
    return
  }
  const root = getEditorContentItemRoot(target)
  const index = getTargetIndexFromDataset(root)
  const { height, left, top } = target.getBoundingClientRect()

  showInfo.value = {
    visible: true,
    left,
    top: top + height,
    index
  }
}

const onMouseout = ({ target }) => {
  showInfo.value.visible = false
  const root = getEditorContentItemRoot(target)
  const index = getTargetIndexFromDataset(root)
  // console.log('🚀 ~ onMouseout ~ index:', index)
  list.value[index].focus = false
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

const onDragover = useThrottleFn(
  (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    console.log('🚀 ~ onDragover ~ e:', e)
  },
  1000,
  true,
  true
)

// function onDragover(e) {
//   e.preventDefault()
//   e.dataTransfer.dropEffect = 'move'
//   console.log('🚀 ~ onDragover ~ e:', e)
// }

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

const infoVisible = computed(() => {
  const index = showInfo.value.index
  // console.log('🚀 ~ infoVisible ~ index:', index)
  const focus = list.value[index].focus

  return showInfo.value.visible && index !== undefined && !focus
})

function handleSelectionChange() {
  logSelection()
}

onMounted(() => {
  document.addEventListener('selectionchange', handleSelectionChange)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelectionChange)
})
</script>

<template>
  <div class="relative">
    <div ref="editorRef" class="outline-none" contenteditable="true">
      <div
        v-for="(item, index) in list"
        :key="item.id"
        :data-id="item.id"
        :data-index="index"
        data-type="content"
        class="text-2xl leading-10 relative"
        draggable="true"
        @mouseover="onMouseover"
        @mouseout="onMouseout"
        @dragstart="onDragStart($event, index)"
        @drop="onDrop($event, index)"
        @dragover="onDragover($event, index)"
        @dragleave="onDragleave($event, index)"
      >
        <div
          contenteditable="false"
          class="absolute left-[-40px] top-2"
          @mouseover.stop=""
        >
          <GripVertical class="drag-handle" />
        </div>
        {{ item.content }}
      </div>

      <div contenteditable="false">search content</div>
    </div>

    <div
      v-if="infoVisible"
      :style="showInfoStyle"
      class="fixed bg-white border px-2"
      contenteditable="false"
    >
      hover content
    </div>
  </div>
</template>
