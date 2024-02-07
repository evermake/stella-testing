<script setup lang="ts">
import { ref } from 'vue';
import { Report } from '../types';
import HighlightedCode from './HighlightedCode.vue';

defineProps<{
  testcase: Report["testcases"][number]
}>()

const expanded = ref(false)
</script>

<template>
  <div
    :class="[
      'testcase',
      (testcase.passed === true) && 'passed',
      (testcase.passed === false) && 'failed',
      (testcase.passed === null) && 'unknown',
    ]"
  >
    <div @click="expanded = !expanded" class="summary">
      <span class="summary-result">
        {{ testcase.passed === true ? '✔' : testcase.passed === false ? '✘' : '?'}}
      </span>
      <span class="summary-name">{{ testcase.name }}</span>
    </div>
    <div v-if="expanded" class="details">
      <HighlightedCode class="code-snippet" :code="testcase.snippet" with-line-numbers lang="Stella" title="Snippet Source" />
      <HighlightedCode class="code-expected-out" :code="testcase.expected" lang="plain" title="Correct Output" />
      <HighlightedCode class="code-actual-out-1" :code="testcase.actualStdout" lang="plain" title="Actual Output (stdout)" />
      <HighlightedCode class="code-actual-out-2" :code="testcase.actualStderr" lang="plain" title="Actual Output (stderr)" />
    </div>
  </div>
</template>

<style scoped>
.testcase {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #333;
}

.testcase.passed .summary-result {
  color: #65b687;
}

.testcase.failed .summary-result {
  color: #e86464;
}

.testcase.unknown .summary-result {
  color: #f6c748;
}

.summary {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 0;
}

.summary:hover {
  background: rgba(255,255,255,0.05);
}

.summary-result {
  text-align: center;
  font-size: 1rem;
  width: 80px;
}

.summary-name {
  flex: 1 0 auto;
  font-family: monospace;
  font-size: 0.875rem;
}

.details {
  padding: 12px;
  display: grid;
  grid-template-rows: max-content 8px max-content 8px max-content;
  grid-template-columns: 1fr 8px 1fr;
}

.code-snippet {
  grid-area: 1 / 1 / span 1 / span 3;
}
.code-expected-out {
  grid-area: 3 / 1 / span 3 / span 1;
}
.code-actual-out-1 {
  grid-area: 3 / 3 / span 1 / span 1;
}
.code-actual-out-2 {
  grid-area: 5 / 3 / span 1 / span 1;
}
</style>