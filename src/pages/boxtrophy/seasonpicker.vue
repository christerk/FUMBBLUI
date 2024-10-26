<template>
  <a
    v-if="selectedSeason != null"
    v-show="!showDropdown"
    href="#"
    @click.prevent="showDropdown = true"
    >Season {{ selectedSeason.season }}</a
  >
  <select
    v-if="selectedSeason != null"
    v-show="showDropdown"
    :value="selectedSeason.season"
    @change="changeSeason($event)"
  >
    <option
      v-for="season in seasons"
      :value="season.season"
      :key="season.season"
    >
      Season {{ season.season }}
    </option>
  </select>
</template>

<style scoped>
@import "./seasonpicker.less";
</style>

<script lang="ts">
import { Component, Vue, Prop, toNative, Emit } from "vue-facing-decorator";

@Component
class SeasonPicker extends Vue {
  @Prop
  public seasons: any;

  @Prop
  public selectedSeason: any = null;

  public showDropdown: boolean = false;

  public mounted() {}

  @Emit
  public changeSeason(event: any) {
    let season = event.target.value;
    for (let s of this.seasons) {
      if (s.season == season) {
        return s;
      }
    }
  }
}

export default toNative(SeasonPicker);
</script>
