<script setup lang="ts">
import { computed, ref } from 'vue';
import { Report, TestcaseConclusion, ReportTestcase as ReportTestcaseType } from '../types';
import ReportTestcase from './ReportTestcase.vue';

const props = defineProps<{
  report: Report
}>()

type PropertySorting<P extends string> = { prop: P, dir: 'asc' | 'desc' }
type Sorting =
  | PropertySorting<'result'>
  | PropertySorting<'name'>

/**
 * Compares 2 strings by splitting them into parts of numbers and non-numbers.
 * 
 * @example
 * compareStringsWithNumbers('a1', 'a2') // -1
 * compareStringsWithNumbers('a2', 'a1') // 1
 * compareStringsWithNumbers('a1', 'a1') // 0
 * compareStringsWithNumbers('a3', 'a10') // -1
 */
function compareStringsWithNumbers(str1: string, str2: string): number {
  const parts1 = str1.split(/(\d+)/).map(part => isNaN(+part) ? part : +part)
  const parts2 = str2.split(/(\d+)/).map(part => isNaN(+part) ? part : +part)
  for (let i = 0; i < parts1.length; i++) {
    if (parts2[i] === undefined) {
      return 1
    }
    if (parts1[i] === parts2[i]) {
      continue
    }
    if (typeof parts1[i] === 'number' && typeof parts2[i] === 'number') {
      return (parts1[i] as number) - (parts2[i] as number)
    }
    return (parts1[i] as string).localeCompare((parts2[i] as string))
  }
  return -1
}

/**
 * Sorts two values by multiple sorting functions.
 */
function sortCombined<T>(values: T[], sorts: ((a: T, b: T) => number)[]): T[] {
  return values.sort((a, b) => {
    for (const sort of sorts) {
      const result = sort(a, b)
      if (result !== 0) {
        return result
      }
    }
    return 0
  })
}

const filter = ref('')
// const sorting = ref<'name-asc' | 'name-desc' | 'result-asc' | 'result-desc'>('result-desc')
const sortings = ref<Sorting[]>([
  { prop: 'result', dir: 'desc' },
  { prop: 'name', dir: 'asc' },
])
const sortedTestcases = computed(() => {
  let filtered = props.report.testcases.slice()

  if (filter.value.trim()) {
    filtered = filtered.filter(tc => tc.name.includes(filter.value))
  }

  const sortingFuncs = sortings.value.map(sorting => {
    if (sorting.prop === 'result') {
      if (sorting.dir === 'asc') {
        return (a: ReportTestcaseType, b: ReportTestcaseType) => compareTestcaseConclusion(a.conclusion, b.conclusion)
      } else {
        return (a: ReportTestcaseType, b: ReportTestcaseType) => compareTestcaseConclusion(b.conclusion, a.conclusion)
      }
    } else if (sorting.prop === 'name') {
      if (sorting.dir === 'asc') {
        return (a: ReportTestcaseType, b: ReportTestcaseType) => compareStringsWithNumbers(a.name, b.name)
      } else {
        return (a: ReportTestcaseType, b: ReportTestcaseType) => compareStringsWithNumbers(b.name, a.name)
      }
    } else {
      return () => 0
    }
  })

  return sortCombined<ReportTestcaseType>(filtered, sortingFuncs)
})
const stats = computed(() => {
  const stats_ = {
    total: 0,
    correct: 0,
    partiallyCorrrect: 0,
    incorrect: 0,
    unknown: 0,
  }
  sortedTestcases.value.forEach(({ conclusion }) => {
    stats_.total += 1
    switch (conclusion) {
      case 'incorrect':
        stats_.incorrect += 1
        break
      case 'correct':
        stats_.correct += 1
        break
      case 'partially-correct':
        stats_.partiallyCorrrect += 1
        break
      case 'unknown':
        stats_.unknown += 1
        break
    }
  })
  return stats_
})

function handleResultHeaderClick() {
  const prevDir = sortings.value.find(s => s.prop === 'result')?.dir ?? null
  const newSortings = sortings.value.filter(s => s.prop !== 'result')
  if (prevDir === null) {
    sortings.value = [
      ...newSortings,
      { prop: 'result', dir: 'asc' },
    ]
  } else if (prevDir === 'asc') {
    sortings.value = [
      ...newSortings,
      { prop: 'result', dir: 'desc' },
    ]
  } else {
    sortings.value = newSortings
  }
}

function handleNameHeaderClick() {
  const prevDir = sortings.value.find(s => s.prop === 'name')?.dir ?? null
  const newSortings = sortings.value.filter(s => s.prop !== 'name')
  if (prevDir === null) {
    sortings.value = [
      ...newSortings,
      { prop: 'name', dir: 'asc' },
    ]
  } else if (prevDir === 'asc') {
    sortings.value = [
      ...newSortings,
      { prop: 'name', dir: 'desc' },
    ]
  } else {
    sortings.value = newSortings
  }
}

function compareTestcaseConclusion(
  conclusionA: TestcaseConclusion,
  conclusionB: TestcaseConclusion,
): number {
  const num = (c: TestcaseConclusion): number => {
    switch (c) {
      case 'correct':
        return 3
      case 'partially-correct':
        return 2
      case 'incorrect':
        return 1
      case 'unknown':
        return 0
    }
  }
  const numA = num(conclusionA)
  const numB = num(conclusionB)
  return numA - numB
}
</script>

<template>
  <div class="viewer">
    <div class="header">
      <input
        type="text"
        class="filter-input"
        v-model="filter"
        placeholder="Filter by name..."
      >
      <div class="stats">
        <span class="stats-correct">{{ stats.correct }} ✔</span>
        <span>+</span>
        <span class="stats-partially-correct">{{ stats.partiallyCorrrect }} ✔</span>
        <span>+</span>
        <span class="stats-incorrect">{{ stats.incorrect }} ✘</span>
        <span>+</span>
        <span class="stats-unknown">{{ stats.unknown }} ?</span>
        <span>=</span>
        <span class="stats-total">{{ stats.total }}</span>
      </div>
    </div>
    <div class="table">
      <div class="table-head">
        <span @click="handleResultHeaderClick" class="head-result">
          Result {{
            sortings.some(s => s.prop === 'result')
              ? sortings.find(s => s.prop === 'result')!.dir === 'asc' ? '↑' : '↓'
              : ''
          }}
        </span>
        <span @click="handleNameHeaderClick" class="head-name">
          Name {{
            sortings.some(s => s.prop === 'name')
              ? sortings.find(s => s.prop === 'name')!.dir === 'asc' ? '↑' : '↓'
              : ''
          }}
        </span>
      </div>
      <ReportTestcase
        v-for="tc in sortedTestcases"
        :key="tc.name"
        :testcase="tc"
      />
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

.header {
  width: 100%;
  max-width: 1140px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stats {
  display: flex;
  height: 100%;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 auto;
}

.stats-correct,
.stats-incorrect,
.stats-partially-correct,
.stats-unknown {
  border: 1px solid;
  padding: 2px 4px;
}

.stats-correct {
  color: var(--c-success);
}

.stats-incorrect {
  color: var(--c-error);
}

.stats-partially-correct,
.stats-unknown {
  color: var(--c-warning);
}

.stats-total {
  font-weight: 600;
}

.filter-input {
  font: inherit;
  color: inherit;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #333;
  outline: none;
  width: 100%;
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
