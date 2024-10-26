<template>
  <div class="panel">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style scoped>
@import "./titledpanel.less";
</style>

<script lang="ts">
import { Component, Vue, toNative } from "vue-facing-decorator";

@Component
class TitledPanel extends Vue {}

export default toNative(TitledPanel);
</script>
