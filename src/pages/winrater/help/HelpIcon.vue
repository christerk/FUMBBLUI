<template>
  <div :id="props.id" class="help-container">
    <div class="help">?</div>
  </div>
  <div class="tooltip">
    <div class="tooltip-content">{{ props.tooltip }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import tippy from "tippy.js";

const props = defineProps({
  id: String,
  tooltip: String,
});

const id: string = props.id as string;

onMounted(() => {
  tippy(document.getElementById(id)!, {
    content: document.getElementsByClassName("tooltip-content")[0],
  });
});
</script>

<style scoped>
@import "./helpIcon.less";
</style>
