<template>
  <Transition>
    <span v-if="show" class="loader"></span>
  </Transition>
</template>

<style scoped>
@import "./spinner.less";
</style>

<script lang="ts">
import { Component, Vue, toNative } from "vue-facing-decorator";

@Component
class Spinner extends Vue {
  public show: boolean = false;

  public mounted() {
    this.show = true;
  }
}

export default toNative(Spinner);
</script>
