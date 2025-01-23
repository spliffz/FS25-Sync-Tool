<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'yes'): void,
  (e: 'no'): void  
}>()
</script>

<template>
  <VueFinalModal
    class="flex justify-center items-center"
    content-class="flex flex-col max-w-xl mx-4 p-4 dark:bg-gray-900 border dark:border-gray-700 rounded-lg space-y-2"
  >
    <h1 class="text-xl">
      {{ title }}
    </h1>
    <slot />
    <div class="text-center">
      <button class="mt-1 ml-auto px-2 border rounded-lg w-1/3" @click="emit('yes')">Yes</button>
      &nbsp; 
      <button class="mt-1 ml-auto px-2 border rounded-lg w-1/3" @click="emit('no')">No</button>
    </div>
    <div class="">
    </div>
  </VueFinalModal>
</template>
