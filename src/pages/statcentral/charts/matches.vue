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
class MatchesChart extends Vue {
  public loaded: boolean = false;
  public chartOptions: any = {};
  public chartSeries: any = [];

  public load(matchData: any): void {
    var data = {
      ranked: [],
      competitive: [],
      stunty: [],
      league: [],
      blackbox: [],
      total: [],
    };
    var categories: string[] = [];
    var annotationIndex = 0;
    var annotationData: any[] = [];
    var annotations = [
      {
        date: "2009-06-26",
        text: "Cyanide BB release",
      },
      {
        date: "2020-03-11",
        text: "Covid-19 pandemic",
      },
      {
        date: "2025-01-27",
        text: "Seasons",
      },
    ];
    while (
      annotationIndex < annotations.length &&
      annotations[annotationIndex].date < matchData[0].Date
    ) {
      annotationIndex++;
    }
    var previousDate = null;
    for (const series of matchData) {
      if (
        annotationIndex < annotations.length &&
        series.Date >= annotations[annotationIndex].date
      ) {
        annotationData.push({
          x: previousDate,
          strokeDashArray: 3,
          borderColor: "#252525",
          label: {
            text: annotations[annotationIndex].text,
          },
        });
        annotationIndex++;
      }
      previousDate = series.Date;
      categories.push(series.Date);
      data.ranked.push(series.Ranked);
      data.competitive.push(series.Competitive);
      data.stunty.push(series.Stunty);
      data.league.push(series.League);
      data.blackbox.push(series.Blackbox);
      data.total.push(series.Total);
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
        id: "Matches",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      annotations: {
        xaxis: annotationData,
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
      },
    };
    this.loaded = true;
  }
}

export default toNative(MatchesChart);
</script>
