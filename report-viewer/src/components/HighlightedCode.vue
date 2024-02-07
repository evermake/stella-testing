<script setup lang="ts">
import { useHighlighting } from '../composables/useHighlighting';

const props = defineProps<{
  title?: string,
  withLineNumbers?: boolean,
  code: string,
  lang: 'Stella' | 'plain'
}>()

const highlightedCode = useHighlighting(props.code || " ", props.lang)
</script>

<template>
  <div class="highlighted-code">
    <h3 v-if="title" class="title">{{ title }}</h3>

    <div
      v-html="highlightedCode"
      :class="[
        'code',
        withLineNumbers && 'with-line-numbers'
      ]"
    ></div>
  </div>
</template>

<style scoped>
.highlighted-code {
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
}

.title {
  text-align: center;
  padding: 4px 0;
  font-size: 0.925rem;
  font-weight: 600;
}

.code {
  height: 100%;
}

.code :deep(pre) {
  padding: 8px;
  border-radius: 4px;
  height: 100%;
  overflow-x: auto;
}

.with-line-numbers :deep(code) {
  counter-reset: step;
  counter-increment: step 0;
}

.with-line-numbers :deep(.line::before) {
  content: counter(step);
  counter-increment: step;
  width: 1rem;
  margin-right: 0.5rem;
  display: inline-block;
  text-align: right;
  color: rgba(115,138,148,.4);
}
</style>
