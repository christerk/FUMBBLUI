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
  <apexchart
    class="skill-details-chart"
    v-if="loaded"
    width="100%"
    height="150px"
    type="bar"
    :options="{
      chart: {
        id: 'skill-details-chart',
        toolbar: {
          show: false,
        },
        stacked: true,
        stackType: '100%',
      },
      grid: {
        show: false,
      },
      xaxis: {
        labels: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        categories: ['Chosen', 'Random'],
      },
      yaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        crosshairs: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: true,
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '16px',
      },
    }"
    :series="[
      {
        name: 'General',
        data: skillDetails.slice(0, 2),
      },
      {
        name: 'Agility',
        data: skillDetails.slice(2, 4),
      },
      {
        name: 'Strength',
        data: skillDetails.slice(4, 6),
      },
      {
        name: 'Passing',
        data: skillDetails.slice(6, 8),
      },
      {
        name: 'Mutations',
        data: skillDetails.slice(8, 10),
      },
      {
        name: 'Stats',
        data: skillDetails.slice(10, 12),
      },
    ]"
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
  public skillDetails: number[] = [];

  public load(skillData: any): void {
    var chosen = 0;
    var random = 0;
    var indices = {
      General: 0,
      Agility: 2,
      Strength: 4,
      Passing: 6,
      Mutations: 8,
      Stats: 10,
    };
    var details = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (const skill of skillData) {
      if (skill.selection === "Chosen") {
        chosen += parseInt(skill.choice_count);
        details[indices[skill.category]] += parseInt(skill.choice_count);
      } else if (skill.selection === "Random") {
        random += parseInt(skill.choice_count);
        details[1 + indices[skill.category]] += parseInt(skill.choice_count);
      }
    }
    this.skillSelection = [chosen, random];
    this.skillDetails = details;
    this.loaded = true;
  }
}

export default toNative(SkillChoiceChart);
</script>
