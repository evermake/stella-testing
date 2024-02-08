<script setup lang="ts">
import { computed, ref } from 'vue';
import { Report, TestcaseConclusion } from '../types';
import ReportTestcase from './ReportTestcase.vue';

const props = defineProps<{
  report: Report
}>()

const filter = ref('')

const sorting = ref<'name-asc' | 'name-desc' | 'result-asc' | 'result-desc'>('name-asc')

function handleResultHeaderClick() {
  if (sorting.value === 'result-asc') {
    sorting.value = 'result-desc'
  } else {
    sorting.value = 'result-asc'
  }
}
function handleNameHeaderClick() {
  if (sorting.value === 'name-asc') {
    sorting.value = 'name-desc'
  } else {
    sorting.value = 'name-asc'
  }
}

function compareTestcaseConclusion(
  conclusionA: TestcaseConclusion,
  conclusionB: TestcaseConclusion,
): number {
  const num = (c: TestcaseConclusion): number => {
    switch (c) {
      case 'incorrect':
        return 0
      case 'correct':
        return 4
      case 'partially-correct':
        return 2
      case 'unknown':
        return 1
    }
  }
  const numA = num(conclusionA)
  const numB = num(conclusionB)
  return numA - numB
}

const sortedTestcases = computed(() => {
  const sorted = props.report.testcases.toSorted((a, b) => {
    if (sorting.value === 'name-asc') {
      return a.name.localeCompare(b.name)
    } else if (sorting.value === 'name-desc') {
      return b.name.localeCompare(a.name)
    } else if (sorting.value === 'result-asc') {
      return compareTestcaseConclusion(a.conclusion, b.conclusion)
    } else if (sorting.value === 'result-desc') {
      return compareTestcaseConclusion(b.conclusion, a.conclusion)
    }
    return 0
  })
  if (filter.value.trim()) {
    return sorted.filter(tc => tc.name.includes(filter.value))
  }
  return sorted
})
</script>

<template>
  <div class="viewer">
    <input
      type="text"
      class="filter-input"
      v-model="filter"
      placeholder="Filter by name..."
    >
    <div class="table">
      <div class="table-head">
        <span @click="handleResultHeaderClick" class="head-result">
          Result {{ sorting === 'result-asc' ? '↑' : sorting === 'result-desc' ? '↓' : '' }}
        </span>
        <span @click="handleNameHeaderClick" class="head-name">
          Name {{ sorting === 'name-asc' ? '↑' : sorting === 'name-desc' ? '↓' : '' }}
        </span>
      </div>
      <ReportTestcase v-for="tc in sortedTestcases" :testcase="tc" />
    </div>
  </div>
</template>

<style scoped>
.viewer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 64px 0;
}

.filter-input {
  font: inherit;
  color: inherit;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #333;
  outline: none;
  width: 100%;
  max-width: 1140px;
  margin-bottom: 12px;
}

.table {
  width: 100%;
  max-width: 1140px;
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.table-head {
  display: flex;
  align-items: center;
  font-weight: 600;
  border-bottom: 3px solid #333;
  padding: 4px 6px;
}

.head-result {
  width: 80px;
}

.head-name {
  flex: 1 0 auto;
}

.head-result,
.head-name {
  cursor: pointer;
}
</style>
