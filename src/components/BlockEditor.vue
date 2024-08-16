<script setup>
import { GripVertical, Heading1, Heading2, Type, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { useBlockRootMouse } from './use-block-root-mouse'
import { useCommon } from './use-common'
import { useDrag } from './use-drag'
import { useExtra } from './use-extra'
import { useRootKeydown } from './use-keydown'
import { useRecommended } from './use-recommended'

const list = ref([
  {
    id: 1,
    type: 0,
    content: 'content 1'
  },
  {
    id: 2,
    type: 1,
    content: 'content 2',
    info: 'info 2'
  },
  {
    id: 3,
    type: 2,
    content: 'content 3'
  },
  {
    id: 4,
    type: 0,
    content: 'content 4'
  }
])

const editorRef = ref()

const { getBlockTypeByAction } = useCommon()
const { onRootKeydown } = useRootKeydown(editorRef)

const {
  onBlockRootMouseout,
  onBlockRootMouseover,
  addBlockMouseout,
  addBlockMouseover
} = useBlockRootMouse()

const {
  operation,
  operationRef,
  dragRef,
  dragging,
  dragContentRef,
  actionRef,
  onDragMousedown,
  onDragMouseup,
  onOperationMouseout,
  onOperationMouseover,
  onAction
} = useDrag({
  editorRef,
  addBlockMouseout,
  addBlockMouseover
})

const { extraInfoRef, extraInfoVisible } = useExtra({
  editorRef,
  dragging,
  list,
  addBlockMouseout,
  addBlockMouseover
})

const { recommendedRef, onRecommended, onCancel } = useRecommended({
  operation,
  editorRef,
  actionRef
})
</script>

<template>
  <div class="relative">
    <div
      ref="editorRef"
      class="editor-root"
      contenteditable="true"
      @keydown="onRootKeydown"
      @mouseover="onBlockRootMouseover"
      @mouseout="onBlockRootMouseout"
    >
      <div
        v-for="item in list"
        :key="item.id"
        :data-id="item.id"
        :data-type="getBlockTypeByAction(item.type)"
        class="editor-block"
      >
        {{ item.content }}
      </div>
    </div>

    <div
      v-show="extraInfoVisible"
      ref="extraInfoRef"
      class="fixed bg-white border p-2 rounded-sm"
      contenteditable="false"
    >
      extra content
    </div>

    <div
      v-show="operation.visible"
      ref="operationRef"
      class="fixed px-2 flex"
      @mouseover="onOperationMouseover"
      @mouseout="onOperationMouseout"
    >
      <div
        ref="dragRef"
        class="drag-handle cursor-grab p-1 hover:bg-slate-100 rounded-sm"
        @mousedown="onDragMousedown"
        @mouseup="onDragMouseup"
      >
        <GripVertical :style="{ opacity: dragging ? 0 : 1 }" @click.stop="" />
      </div>
    </div>

    <div ref="dragContentRef" class="fixed"></div>

    <div
      ref="actionRef"
      class="fixed border p-2 rounded-sm shadow-sm bg-white hidden"
    >
      <div class="flex items-center gap-2">
        <div class="bg-slate-100 p-1 rounded-sm cursor-pointer">
          <Heading1 @click="onAction(1)" />
        </div>
        <div class="bg-slate-100 p-1 rounded-sm cursor-pointer">
          <Heading2 @click="onAction(2)" />
        </div>
        <div class="bg-slate-100 p-1 rounded-sm cursor-pointer">
          <Type @click="onAction(0)" />
        </div>
      </div>
      <div
        class="h-10 mt-2 bg-slate-100 rounded-sm cursor-pointer"
        @click="onRecommended"
      ></div>
    </div>

    <div ref="recommendedRef" class="fixed hidden border rounded-sm p-2">
      <div class="flex justify-between items-center">
        recommended loading
        <div
          class="bg-slate-100 rounded-sm p-1 cursor-pointer"
          @click="onCancel"
        >
          <X />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.editor-root {
  @apply outline-none relative;
}

.editor-block {
  @apply leading-6 min-h-[2em] py-[3px] px-[2px];
}

.editor-block[data-type='heading1'] {
  @apply text-2xl;
}

.editor-block[data-type='heading2'] {
  @apply text-xl;
}
</style>
