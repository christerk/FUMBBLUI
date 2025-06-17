<template>
  <div class="wrap">
    <div class="versus-stats-chart">
      <div class="cell"></div>
      <template v-for="(roster, index) in order">
        <div
          class="icon"
          v-tippy="{ content: roster }"
          :style="{ 'grid-column': index + 2 }"
        >
          <img :src="getIcon(roster)" class="team-icon" />
          <img :src="getIcon(roster)" class="team-icon" />
        </div>
      </template>
      <div class="cell" :style="{ 'grid-column': order.length + 2 }"></div>
      <template v-for="row in chartSeries">
        <div class="row">
          <div class="icon" v-tippy="{ content: row.name }">
            <img :src="getIcon(row.name)" class="team-icon" />
          </div>
          <template v-for="(cell, index) in row.data">
            <div
              class="col"
              v-tippy="{
                content:
                  cell.vs +
                  '<br>' +
                  'Games: ' +
                  cell.total_matches +
                  '<div>(Click for more)</div>',
              }"
              :style="{ 'grid-column': index + 2 }"
              @click="() => selectMatchup(cell.roster, cell.opponent)"
            >
              <div
                :class="{
                  bg: true,
                  red: parseInt(cell.win_rate) < 50,
                  green: parseInt(cell.win_rate) > 50,
                }"
                :style="{ opacity: calcOpacity(parseInt(cell.win_rate)) }"
              ></div>
              <div class="val">
                {{ cell.win_rate }}
              </div>
            </div>
          </template>
          <div
            class="col"
            v-tippy="{
              content: 'Games: ' + row.total_matches,
            }"
            :style="{ 'grid-column': row.data.length + 2 }"
          >
            <div
              :class="{
                bg: true,
                red: parseInt(row.total_win_rate) < 50,
                green: parseInt(row.total_win_rate) > 50,
              }"
              :style="{ opacity: calcOpacity(row.total_win_rate) }"
            ></div>
            <div class="val">
              {{ row.total_win_rate }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@import "./versusstats.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref, Emit } from "vue-facing-decorator";
import FumbblApi from "@api/fumbbl";
import VueApexCharts from "vue3-apexcharts";
import { Tippy, setDefaultProps } from "vue-tippy";
import { directive as VTippy } from "vue-tippy";
import "tippy.js/themes/light.css";

@Component({
  components: {
    apexchart: VueApexCharts,
    tippy: Tippy,
  },
  directives: {
    tippy: VTippy,
  },
})
class VersusStatsChart extends Vue {
  public loaded: boolean = false;
  public order: string[] = [];

  public chartSeries: any[] = [];

  public rosterIcons: { [key: string]: string } = {};

  @Emit("selectMatchup")
  public selectMatchup(roster: string, opponent: string): void {
    return {
      roster: roster,
      opponent: opponent,
    };
  }

  public async load(data: any): void {
    setDefaultProps({
      theme: "fumbbl",
      placement: "top",
      interactive: true,
      animation: "",
      allowHTML: true,
    });

    var results = data.data;

    var versusData = {};
    var order = [];

    for (var row in results) {
      const roster = results[row].roster1;
      const opponent = results[row].roster2;
      const totalMatches = Number(results[row].total_matches);
      const totalWins = Number(results[row].wins);
      const totalTies = Number(results[row].ties);
      const winRate = results[row].adjusted_win_rate;
      const tieRate = results[row].tie_rate;

      if (versusData[roster] === undefined) {
        order.push(roster);
        versusData[roster] = {
          name: roster,
          total_win_rate: results[row].total_adjusted_win_rate,
          total_matches: results[row].total_games,
          data: {},
        };
      }

      versusData[roster].data[opponent] = {
        total_matches: totalMatches,
        total_wins: totalWins,
        total_ties: totalTies,
        win_rate: winRate,
        tie_rate: tieRate,
      };
    }

    this.order = order;
    var series = [];
    for (var roster in this.order) {
      series.push({
        name: this.order[roster],
        total_win_rate:
          versusData[this.order[roster]].total_win_rate.toFixed(0),
        total_matches: versusData[this.order[roster]].total_matches,
        data: this.order.map(function (opponent) {
          const opp = versusData[order[roster]].data[opponent];
          if (opp === undefined) {
            return {
              win_rate: "0",
              total_matches: 0,
              vs: order[roster] + " vs " + opponent,
            };
          }
          return {
            win_rate: opp.win_rate.toFixed(0),
            total_matches: opp.total_matches,
            roster: order[roster],
            opponent: opponent,
            vs: order[roster] + " vs " + opponent,
          };
        }),
      });
    }

    this.chartSeries = series;

    var fumbblApi = new FumbblApi();
    var rosters = await fumbblApi.Roster.list(4);
    for (var i = 0; i < rosters.length; i++) {
      this.rosterIcons[rosters[i].name] = rosters[i].logos["32"];
    }

    this.loaded = true;
  }

  public getIcon(roster: string): string {
    return "https://fumbbl.com/i/" + (this.rosterIcons[roster] || "486370");
  }

  public calcOpacity(value: number): number {
    var opacity = Math.abs(parseInt(value) - 50) / 25;

    return Math.min(Math.max(opacity, 0), 1);
  }
}

export default toNative(VersusStatsChart);
</script>
