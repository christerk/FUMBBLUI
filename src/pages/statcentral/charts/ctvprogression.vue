<template>
  <apexchart
    v-show="loaded"
    width="100%"
    type="line"
    :options="resultOptions"
    :series="resultSeries"
  ></apexchart>
  <apexchart
    v-show="loaded"
    class="volume"
    width="100%"
    type="bar"
    :options="volumeOptions"
    :series="volumeSeries"
  ></apexchart>
</template>

<style scoped>
@import "./rosterresults.less";
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
class CtvProgressionChart extends Vue {
  public loaded: boolean = false;
  public resultOptions: any = {};
  public resultSeries: any = [];

  public volumeOptions: any = {};
  public volumeSeries: any = [];

  public load(resultData: any): void {
    const chartMin = resultData.reduce(
      (min: number, p: any) => (p.avgCtv < min ? p.avgCtv : min),
      resultData[0].avgCtv,
    );
    const chartMax = resultData.reduce(
      (max: number, p: any) => (p.avgCtv > max ? p.avgCtv : max),
      resultData[0].avgCtv,
    );
    const flooredMin = Math.floor((chartMin - 50000) / 100000) * 100000;
    const ceiledMax = Math.ceil((chartMax + 50000) / 100000) * 100000;
    var results = {
      name: "CTV",
      type: "line",
      data: [],
    };
    var volume = {
      name: "Matches Played",
      type: "bar",
      data: [],
    };

    var resultOptions = {
      chart: {
        id: "CtvProgressionResults",
        type: "line",
        height: "300px",
        group: "ctvprogressionresults",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      markers: {
        size: 0,
      },
      grid: {
        borderColor: "#808080",
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        area: {
          stacked: "percent",
        },
        bar: {
          horizontal: false,
        },
      },
      xaxis: {
        tickPlacement: "between",
        labels: {
          show: false,
        },
        categories: [],
      },
      yaxis: [
        {
          labels: {
            formatter: (val: number) => Math.round(val / 1000) + "k",
            minWidth: 50,
            maxWidth: 50,
          },
          min: flooredMin,
          max: ceiledMax,
        },
      ],
      stroke: {
        curve: "smooth",
        width: 4,
        colors: "#252525",
      },
      fill: {
        type: "solid",
        opacity: 1,
      },
      colors: "#252525",
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "center",
      },
      tooltip: {
        show: true,
        shared: true,
        intersect: false,
      },
    };
    var volumeOptions = {
      chart: {
        id: "CtvProgressionVolume",
        type: "bar",
        height: "150px",
        group: "ctvprogressionresults",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        categories: [],
      },
      yaxis: [
        {
          labels: {
            formatter: (val: number) => val,
            minWidth: 50,
            maxWidth: 50,
          },
          min: 0,
        },
      ],
      legend: {
        show: true,
        showForSingleSeries: true,
        position: "bottom",
        horizontalAlign: "center",
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        show: true,
        shared: true,
        intersect: false,
      },
    };

    for (const series of resultData) {
      var ctv = series.avgCtv ?? 0;
      var num = series.num ?? 0;
      results.data.push(ctv);
      resultOptions.xaxis.categories.push("Game: " + series.seasongames);

      volume.data.push(num);
      volumeOptions.xaxis.categories.push(series.seasongames);
    }
    this.resultSeries = [results];
    this.resultOptions = resultOptions;

    this.volumeSeries = [volume];
    this.volumeOptions = volumeOptions;

    this.loaded = true;
  }
}

export default toNative(CtvProgressionChart);
</script>
