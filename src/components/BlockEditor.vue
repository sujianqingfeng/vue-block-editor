<script setup>
import { GripVertical } from 'lucide-vue-next'
import { ref } from 'vue'
import { useBlockRootMouse } from './use-block-root-mouse'
import { useCommon } from './use-common'
import { useDrag } from './use-drag'
import { useExtra } from './use-extra'

let count = -100

const mock = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  type: 0,
  content: `content ${i}`,
  hasInfo: true
}))

const list = ref(mock)

const editorRef = ref()

const { findEditorBlock } = useCommon()

function onRootKeydown(e) {
  const { key } = e
  if (key === 'Enter') {
    e.preventDefault()
    const range = window.getSelection().getRangeAt(0)

    const block = findEditorBlock(range.endContainer)

    if (!block) {
      return
    }

    const textContent = range.startContainer.textContent
    const offset = range.endOffset

    const textBefore = textContent.slice(0, offset)
    const textAfter = textContent.slice(offset)

    range.startContainer.textContent = textBefore

    const newLine = document.createElement('div')
    newLine.textContent = textAfter || ''
    newLine.className = 'editor-block'
    newLine.dataset.id = count--

    editorRef.value.insertBefore(newLine, block.nextSibling)

    const newRange = document.createRange()
    const selection = window.getSelection()
    newRange.setStart(newLine, 0)
    newRange.setEnd(newLine, 0)
    selection.removeAllRanges()
    selection.addRange(newRange)
  }
}

const {
  onBlockRootMouseout,
  onBlockRootMouseover,
  addBlockMouseout,
  addBlockMouseover
} = useBlockRootMouse()

const { showExtraInfoStyle, extraInfoVisible } = useExtra({
  editorRef,
  addBlockMouseout,
  addBlockMouseover
})

const {
  operation,
  operationStyle,
  operationRef,
  dragRef,
  dragging,
  onDragStart,
  onDragEnd,
  onBlockRootDragover,
  onBlockRootDrop
} = useDrag({
  editorRef,
  addBlockMouseout,
  addBlockMouseover
})
</script>

<template>
  <div class="relative">
    <div
      ref="editorRef"
      class="editor-root outline-none"
      contenteditable="true"
      @keydown="onRootKeydown"
      @mouseover="onBlockRootMouseover"
      @mouseout="onBlockRootMouseout"
      @dragover="onBlockRootDragover"
      @drop="onBlockRootDrop"
    >
      <div
        v-for="(item, index) in list"
        :key="item.id"
        :data-id="index"
        :data-index="index"
        class="editor-block"
      >
        {{ item.content }}
      </div>
    </div>

    <div
      v-if="extraInfoVisible"
      :style="showExtraInfoStyle"
      class="fixed bg-white border px-2"
      contenteditable="false"
    >
      hover content
    </div>

    <!-- v-if="operation.visible" -->
    <div
      ref="operationRef"
      :style="operationStyle"
      class="fixed px-2 flex"
      @mouseover.stop=""
    >
      <div
        ref="dragRef"
        draggable="true"
        class="drag-handle flex"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
      >
        <GripVertical :style="{ opacity: dragging ? 0 : 1 }" />
      </div>
    </div>
  </div>
</template>

<style>
.editor-block {
  @apply leading-4 min-h-[1em] py-[3px] px-[2px];
}
</style>
