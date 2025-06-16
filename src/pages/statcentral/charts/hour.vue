<template>
  <apexchart
    v-if="loaded"
    width="100%"
    height="100%"
    type="line"
    :options="chartOptions"
    :series="chartSeries"
  ></apexchart>
</template>

<style scoped>
@import "./matches.less";
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
class HourChart extends Vue {
  public loaded: boolean = false;
  public chartOptions: any = {};
  public chartSeries: any = [];

  public load(hourlyData: any): void {
    var data = {
      yesterday: [],
      average: [],
    };

    var categories: string[] = [];
    for (const series of hourlyData) {
      categories.push(series.hour_of_day);
      data.yesterday.push(series.matches_yesterday);
      data.average.push(series.avg_matches_per_hour_30_days);
    }

    // Add non-zero series to chart
    this.chartSeries = Object.entries(data)
      .filter(([name, values]) => values.some((v: number) => v !== 0))
      .map(([name, values]) => ({
        name: name,
        data: values,
      }));

    this.chartOptions = {
      chart: {
        id: "HourlyMatches",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          useHTML: true,
          rotate: 0,
          hideOverlappingLabels: false,
          formatter: function (value) {
            if (
              value === categories[0] ||
              value == categories[categories.length - 1]
            ) {
              return value; // Show first and last labels
            }
            return value;
          },
        },
      },
      stroke: {
        curve: "smooth",
        width: [3, 2],
        dashArray: [0, 2],
      },
    };
    this.loaded = true;
  }
}

export default toNative(HourChart);
</script>
