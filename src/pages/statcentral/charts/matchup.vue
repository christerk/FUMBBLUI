<template>
  <apexchart
    v-show="loaded"
    width="100%"
    type="bar"
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
@import "./matchup.less";
</style>

<script lang="ts">
import {
  Component,
  Vue,
  toNative,
  Ref,
  Emit,
  Prop,
} from "vue-facing-decorator";
import FumbblApi from "@api/fumbbl";
import VueApexCharts from "vue3-apexcharts";
import { Tippy, setDefaultProps } from "vue-tippy";
import { directive as VTippy } from "vue-tippy";
import "tippy.js/themes/light.css";

@Component({
  components: {
    apexchart: VueApexCharts,
  },
})
class MatchupChart extends Vue {
  public loaded: boolean = false;
  public matchup: any = null;

  public resultOptions: any = {
    chart: {
      id: "RosterResults",
      show: false,
      height: "300px",
    },
    yaxis: [
      {
        labels: {
          formatter: (val: number) => val + "%",
          minWidth: 50,
          maxWidth: 50,
        },
        min: 0,
        max: 100,
      },
    ],
  };
  public resultSeries: any = [
    {
      chart: {
        id: "RosterVolume",
        show: false,
        height: "200px",
      },
    },
  ];

  public volumeOptions: any = {};
  public volumeSeries: any = [];

  public async load(data: any): void {
    this.matchup = data.data;

    var results = [
      {
        name: "Wins",
        type: "bar",
        data: [],
      },
      {
        name: "Ties",
        type: "bar",
        data: [],
      },
      {
        name: "Losses",
        type: "bar",
        data: [],
      },
      {
        name: "Wins + Ties / 2",
        type: "line",
        data: [],
      },
    ];

    var volume = {
      name: "Matches Played",
      type: "bar",
      data: [],
    };

    var resultOptions = {
      chart: {
        id: "RosterResults",
        type: "bar",
        stacked: true,
        height: "300px",
        group: "rosterresults",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
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
        labels: {
          show: false,
        },
        categories: [],
      },
      yaxis: [
        {
          labels: {
            formatter: (val: number) => val + "%",
            minWidth: 50,
            maxWidth: 50,
          },
          min: 0,
          max: 100,
        },
      ],
      stroke: {
        curve: "smooth",
        dashArray: [0, 0, 0, 4],
        width: [0, 0, 0, 2],
        colors: [
          "#00E396", // Wins
          "#FEB019", // Ties
          "#FF4560", // Losses
          "#252525", // Wins + Ties / 2
        ],
      },
      fill: {
        type: "solid",
        opacity: [0.8, 0.8, 0.8, 1],
      },
      colors: [
        "#00E396", // Wins
        "#FEB019", // Ties
        "#FF4560", // Losses
        "#252525", // Wins + Ties / 2
      ],
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
        id: "RosterVolume",
        type: "bar",
        height: "200px",
        group: "rosterresults",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        categories: [],
        labels: {
          rotate: -45,
        },
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

    for (const series of data.data) {
      var wins = series.win_rate_percentage;
      var losses = series.loss_rate_percentage;
      var ties = series.tie_rate_percentage;
      results[0].data.push(wins);
      results[1].data.push(ties);
      results[2].data.push(losses);
      results[3].data.push((wins + ties / 2).toFixed(2));
      resultOptions.xaxis.categories.push(series.ctv1_bucket / 1000 + "k");

      volume.data.push(series.total_matches ?? 0);
      volumeOptions.xaxis.categories.push(series.ctv1_bucket / 1000 + "k");
    }
    this.resultSeries = results;
    this.resultOptions = resultOptions;

    this.volumeSeries = [volume];
    this.volumeOptions = volumeOptions;

    this.loaded = true;
  }

  public getIcon(roster: string): string {
    return "https://fumbbl.com/i/" + (this.rosterIcons[roster] || "486370");
  }
}

export default toNative(MatchupChart);
</script>
