<template>
  <drag v-if="draggable" :data="roster" class="roster draggable">
    <img :src="'https://fumbbl.com/i/' + roster.logo" />{{ roster.roster }}
  </drag>
  <div v-else class="roster">
    <img :src="'https://fumbbl.com/i/' + roster.logo" />
    <div class="name">{{ roster.roster }}</div>
  </div>
</template>

<style scoped>
@import "./rosterbox.less";
</style>

<script lang="ts">
import { Component, Vue, Prop, toNative } from "vue-facing-decorator";
import { Drag } from "vue-easy-dnd";

@Component({
  components: {
    drag: Drag,
  },
})
class RosterBox extends Vue {
  @Prop
  public roster: any;

  @Prop
  public draggable: boolean = false;

  public mounted() {}
}

export default toNative(RosterBox);
</script>
