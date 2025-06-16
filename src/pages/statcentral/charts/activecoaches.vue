<template>
  <apexchart
    v-if="loaded"
    width="100%"
    type="donut"
    :options="{
      chart: {
        id: 'donut-chart',
      },
      labels: ['Played', 'Website Only'],
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
        formatter: function (val: number, opts) {
          return opts.w.config.series[opts.seriesIndex];
        },
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
                label: 'Total',
                formatter: (w) =>
                  w.globals.seriesTotals.reduce((a, b) => a + b, 0),
              },
            },
          },
        },
      },
    }"
    :series="activeCoaches"
  ></apexchart>
</template>

<style scoped>
@import "./activecoaches.less";
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
class MatchesChart extends Vue {
  public loaded: boolean = false;
  public activeCoaches: number[] = [];

  public load(coachData: any): void {
    const played = coachData.played;
    const access = coachData.access - played;
    this.activeCoaches = [played, access];
    this.loaded = true;
  }
}

export default toNative(MatchesChart);
</script>
