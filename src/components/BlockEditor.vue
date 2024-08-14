<script setup>
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
  console.log('🚀 ~ logSelection ~ selection:', parentNode)
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

function getEditorContentRoot(target) {
  while (target) {
    if (target.dataset.type === 'content') {
      return target
    }
    target = target.parentNode
  }
}

function onEnter(e) {
  console.log('🚀 ~ onEnter ~ e:', e)
  const selectionEnd = e.target.selectionEnd
  console.log('🚀 ~ onEnter ~ selectionEnd:', selectionEnd)
}

const onMouseover = ({ target }) => {
  const selection = window.getSelection()
  const len = selection.toString().length
  if (len) {
    return
  }
  const root = getEditorContentRoot(target)
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
  const root = getEditorContentRoot(target)
  const index = getTargetIndexFromDataset(root)
  // console.log('🚀 ~ onMouseout ~ index:', index)
  list.value[index].focus = false
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
    <div ref="editorRef">
      <div
        v-for="(item, index) in list"
        :key="item.id"
        :data-id="item.id"
        :data-index="index"
        data-type="content"
        class="text-xl leading-10 relative"
        contenteditable="true"
        @mouseover="onMouseover"
        @mouseout="onMouseout"
        @keydown.enter="onEnter"
      >
        <div contenteditable="false" class="absolute left-[-40px] top-2">
          <GripVertical />
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
