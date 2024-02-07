<script setup lang="ts">
import { provide, ref } from 'vue';
import { getHighlighterCore, HighlighterCore } from 'shiki/core'
import getWasm from 'shiki/wasm'
import vitesseDark from 'shiki/themes/vitesse-dark.mjs'
import stellaGrammar from './assets/stella.tmLanguage.json'
import type { Report } from "./types"
import ReportPicker from './components/ReportPicker.vue';
import ReportViewer from './components/ReportViewer.vue';
import { SHIKI_HIGHLITER_KEY } from './constants';

const report = ref<Report | null>(null)

function handleReportSelect(selectedReport: Report) {
  report.value = selectedReport
}

// Stella Shiki highlighter
const highlighter = ref<HighlighterCore>()
provide(SHIKI_HIGHLITER_KEY, highlighter)

getHighlighterCore({
  themes: [vitesseDark],
  langs: [stellaGrammar as any],
  loadWasm: getWasm
})
  .then((loadedHighlighter) => {
    highlighter.value = loadedHighlighter
  })
  .catch(err => void console.error(err))
</script>

<template>
  <ReportPicker
    v-if="report == null"
    @report-selected="handleReportSelect"
  />
  <ReportViewer
    v-else
    :report="report"
  />
</template>

<style scoped>
</style>
