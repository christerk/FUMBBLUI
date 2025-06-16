<template>
  <table class="skill-selection-table">
    <thead>
      <tr>
        <th>Skill</th>
        <th>Players</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="skill in selections">
        <tr>
          <td>{{ skill.skill }}</td>
          <td>{{ skill.player_count_with_skill }}</td>
          <td>{{ skill.skill_percentage.toFixed(2) }}%</td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped>
@import "./skillselection.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref } from "vue-facing-decorator";
import FumbblApi from "@api/fumbbl";
import VueApexCharts from "vue3-apexcharts";

@Component({
  components: {
    apexchart: VueApexCharts,
  },
})
class SkillSelectionChart extends Vue {
  public loaded: boolean = false;
  public selections: number[] = [];

  public load(skillData: any): void {
    this.selections = skillData;
    this.loaded = true;
  }
}

export default toNative(SkillSelectionChart);
</script>
