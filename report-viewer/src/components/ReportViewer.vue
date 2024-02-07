<script setup lang="ts">
import { computed, ref } from 'vue';
import { Report } from '../types';
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

function comparePassed(passedA: boolean | null, passedB: boolean | null): 1 | 0 | -1 {
  if (passedA === passedB) {
    return 0
  }

  if (typeof passedA === 'boolean' && typeof passedB === 'boolean') {
    return passedA
      ? (passedB ? 0 : 1)
      : (passedB ? -1 : 0)
  }

  return passedA === null ? 1 : -1
}

const sortedTestcases = computed(() => {
  const sorted = props.report.testcases.toSorted((a, b) => {
    if (sorting.value === 'name-asc') {
      return a.name.localeCompare(b.name)
    } else if (sorting.value === 'name-desc') {
      return b.name.localeCompare(a.name)
    } else if (sorting.value === 'result-asc') {
      return comparePassed(a.passed, b.passed)
    } else if (sorting.value === 'result-desc') {
      return comparePassed(b.passed, a.passed)
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
