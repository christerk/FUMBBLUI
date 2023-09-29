<template>
  <button class="iconButton" @click.prevent="passedCallback">
    <img :src="props.src" :alt="props.alt" />
  </button>
</template>

<script setup lang="ts">
import { useLoading } from 'vue-loading-overlay'

const props = defineProps({
  callback: Function,
  src: String,
  alt: String,
  showIndicator: Boolean
})

const loading = useLoading()
function passedCallback() {
  if (props.callback) {
    if (props.showIndicator) {
      const loader = loading.show()
      setTimeout(() => {
        if (props.callback) {
          props.callback()
        }
        loader.hide()
      }, 1)
    } else {
      props.callback()
    }
  }
}
</script>

<style scoped>
@import './iconButton.less';
</style>
