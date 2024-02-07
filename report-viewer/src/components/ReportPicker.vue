<script setup lang="ts">
import { ref, watch } from 'vue';
import { Report, ReportOriginal } from '../types';
import { parseJsonFile } from "../utils/read-files"

const emit = defineEmits<{
  (e: 'report-selected', report: Report): void
}>()

const input = ref<HTMLInputElement>()
watch(input, (newInput, _, onCleanup) => {
  if (!newInput) {
    return
  }

  const handleSelect = () => {
  
    if (newInput.files) {
      parseJsonFile<ReportOriginal>(newInput.files[0])
        .then(report => emit('report-selected', {
          testcases: Object.entries(report.testcases).map(([name, tc]) => ({
            name,
            ...tc,
          }))
        }))
    }
  }

  newInput.addEventListener("change", handleSelect)

  onCleanup(() => {
    newInput.removeEventListener("change", handleSelect)
  })
})
</script>

<template>
  <div class="wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661l-2.41-7.839a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"></path></svg>
    <input 
      ref="input"
      type="file"
      accept=".json"
      class="input"
    >
  </div>
</template>

<style>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-size: 128px;
  width: 100%;
  height: 100%;
  flex-grow: 1;
}

.input {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  opacity: 0;
}
</style>
