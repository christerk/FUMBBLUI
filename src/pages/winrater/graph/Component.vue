<script lang="ts" setup>
import * as Plot from '@observablehq/plot'
import { Line } from '@observablehq/plot'
import { onMounted, onUnmounted } from 'vue'
import { useMatchStore } from '../pinia/store'
import { storeToRefs } from 'pinia'
import PlotGraph from './PlotGraph.vue'

const matchStore = useMatchStore()

const { stores, modificationCounter } = storeToRefs(matchStore)

function dataMarks() {
  const lines: Line[] = []
  for (const value of stores.value.values()) {
    value.graphs().forEach((graph) => {
      lines.push(graph.line)
    })
  }
  return lines
}

function ticks(): number {
  return parentWidth() / 80
}

function parentWidth() {
  return window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', resizeCallback)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCallback)
})

const resizeCallback = () => {
  modificationCounter.value += 1
}
</script>

<style scoped>
@import './graph.less';
</style>

<template>
  <div id="plot">
    <PlotGraph
      v-if="stores.size > 0 && modificationCounter > 0"
      :key="modificationCounter"
      :options="{
        width: parentWidth(),
        height: 600,
        fontSize: 20,
        marks: [...dataMarks(), Plot.ruleY([0]), Plot.ruleX([0], { x: 1, y1: 0, y2: 1 })],
        y: {
          percent: true,
          grid: true,
          label: '',
          labelArrow: 'none',
          ticks: 20
        },
        x: {
          label: '',
          labelArrow: 'none',
          ticks: ticks()
        },
        className: 'plotClass'
      }"
    />
  </div>
</template>
