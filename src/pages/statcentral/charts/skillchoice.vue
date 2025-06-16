<template>
  <apexchart
    v-if="loaded"
    width="100%"
    type="donut"
    :options="{
      chart: {
        id: 'donut-chart',
      },
      labels: ['Chosen', 'Random'],
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '16px',
        markers: {
          width: 10,
          height: 10,
        },
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 'normal',
              },
              total: {
                show: true,
                label: 'Number of Skills',
                formatter: (w) =>
                  w.globals.seriesTotals.reduce((a, b) => a + b, 0),
              },
            },
          },
        },
      },
    }"
    :series="skillSelection"
  ></apexchart>
</template>

<style scoped>
@import "./skillchoice.less";
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
class SkillChoiceChart extends Vue {
  public loaded: boolean = false;
  public skillSelection: number[] = [];

  public load(skillData: any): void {
    var chosen = 0;
    var random = 0;

    for (const skill of skillData) {
      if (skill.selection === "Chosen") {
        chosen = parseInt(skill.choice_count);
      } else if (skill.selection === "Random") {
        random = parseInt(skill.choice_count);
      }
    }
    this.skillSelection = [chosen, random];
    this.loaded = true;
  }
}

export default toNative(SkillChoiceChart);
</script>
