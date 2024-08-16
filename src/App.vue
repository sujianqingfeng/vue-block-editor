<script setup>
import BlockEditor from './components/BlockEditor.vue'
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold text-center py-10">Block Editor</h1>

    <div class="flex justify-start">
      <div class="w-[200px]"></div>
      <div class="flex-1">
        <BlockEditor />
      </div>
      <div class="w-[200px]"></div>
    </div>
  </div>
</template>
