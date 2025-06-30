<template>
  <div class="container statcentral" id="vuecontent">
    <PageHeader
      ref="nav"
      :navItems="navItems"
      defaultPage="dashboard"
      @setPage="setPage"
      :enableUrlNav="true"
    >
      <template #pagename>Statistics Central </template>
      <template #center> </template>
    </PageHeader>

    <div class="panel" id="dashboard" v-if="page == 'dashboard'">
      <div class="description">
        <Pill
          class="row center"
          label="Time Period"
          :values="[
            { name: '30d', label: '30 days' },
            { name: '30w', label: '30 weeks' },
            { name: '30m', label: '30 months' },
            { name: '30q', label: '30 quarters' },
            { name: 'all', label: 'All' },
          ]"
          v-model="dashboardRange"
          @change="reloadPage"
        />
      </div>

      <div id="dashboard-grid">
        <TitledPanel>
          <template #header>Matches</template>
          <template #content>
            <MatchesChart ref="matchesChart" />
          </template>
        </TitledPanel>

        <TitledPanel>
          <template #header>Active Coaches</template>
          <template #content>
            <ActiveCoachesChart ref="activeCoachesChart" />
          </template>
        </TitledPanel>

        <TitledPanel>
          <template #header>Matches per Weekday</template>
          <template #content>
            <WeekdayChart ref="weekdayChart" />
          </template>
        </TitledPanel>

        <TitledPanel>
          <template #header>Matches per Hour</template>
          <template #content>
            <HourChart ref="hourChart" />
          </template>
        </TitledPanel>
      </div>
    </div>

    <div class="panel" id="results" v-if="page == 'results'">
      <div class="description cols6">
        <Pill
          class="row span3 start"
          label="Time Period"
          :values="[
            { name: '30d', label: '30 days' },
            { name: '30w', label: '30 weeks' },
            { name: '30m', label: '30 months' },
            { name: '30q', label: '30 quarters' },
            { name: 'all', label: 'All' },
          ]"
          v-model="resultsRange"
          @change="reloadPage"
        />
        <Pill
          class="row span3 end"
          label="Match Type"
          :values="[
            { name: 'all', label: 'Combined' },
            { name: 'open', label: 'Open' },
            { name: 'blackbox', label: 'Blackbox' },
          ]"
          v-model="resultsType"
          @change="reloadPage"
        />

        <Pill
          class="row span2 start"
          label="CTV Range"
          :values="[
            { name: 'all', label: 'All' },
            { name: 'low', label: '< 1300k' },
            { name: 'mid', label: '1300k - 1500k' },
            { name: 'high', label: '> 1500k' },
          ]"
          v-model="resultsCtvRange"
          @change="reloadPage"
        />

        <Pill
          class="row span2"
          label="Mirrors"
          :values="[
            { name: true, label: 'Yes' },
            { name: false, label: 'No' },
          ]"
          v-model="resultsMirrors"
          @change="reloadPage"
        />

        <Pill
          class="row span2 end"
          label="Roster"
          type="select"
          :values="rosterData"
          v-model="resultsSelectedRoster"
          @change="reloadPage"
        />
      </div>
      <TitledPanel class="roster-results">
        <template #header>Roster Results</template>
        <template #content>
          <RosterResultsChart ref="rosterAnalysisChart" />
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="versus" v-if="page == 'versus'">
      <div class="description cols6">
        <Pill
          class="row span2 end"
          type="select"
          label="Period"
          :values="[
            { name: 'All', label: 'All' },
            ...Array.from(
              { length: new Date().getFullYear() - 2003 + 1 },
              (_, i) => ({
                name: (2003 + i).toString(),
                label: (2003 + i).toString(),
              }),
            ).reverse(),
          ]"
          v-model="rostersSelectedYear"
          @change="reloadPage"
        >
          <Pill
            v-if="rostersSelectedYear !== 'All'"
            type="select"
            :unwrap="true"
            :values="[
              { name: 'All', label: 'All Months' },
              ...[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((month) => ({ name: month, label: month })),
            ]"
            v-model="rostersSelectedMonth"
            @change="reloadPage"
          />
        </Pill>

        <Pill
          class="row span2"
          label="Match Type"
          :values="[
            { name: 'all', label: 'All' },
            { name: 'open', label: 'Open' },
            { name: 'blackbox', label: 'Blackbox' },
          ]"
          v-model="rostersSelectedType"
          @change="reloadPage"
        />

        <Pill
          class="row span2 start"
          label="Include Legacy"
          :values="[
            { name: true, label: 'Yes' },
            { name: false, label: 'No' },
          ]"
          v-model="rostersIncludeLegacy"
          @change="reloadPage"
        />
      </div>

      <VersusStatsChart
        ref="versusStats"
        v-show="showMatchup === null"
        @selectMatchup="selectMatchup"
      />

      <div v-show="showMatchup !== null">
        <button class="back" @click="showMatchup = null">&lt;&lt; Back</button>
        <TitledPanel>
          <template #header>
            <span v-if="showMatchup"
              >Results per CTV bracket - Matchup: {{ showMatchup.roster }} vs
              {{ showMatchup.opponent }}
            </span></template
          >
          <template #content>
            <MatchupChart ref="matchupChart" />
          </template>
        </TitledPanel>
      </div>
    </div>

    <div class="panel" id="skills" v-show="page == 'skills'">
      <div class="description cols2">
        <Pill
          class="row end"
          type="select"
          label="Roster"
          :values="rosterData"
          v-model="skillsSelectedRoster"
        />

        <Pill
          v-show="skillsSelectedRoster !== 'All'"
          class="row start"
          label="Position"
          type="select"
          :values="[
            { name: 'All', label: 'All' },
            ...positions.map((position) => ({
              name: position,
              label: position,
            })),
          ]"
          v-model="skillsSelectedPosition"
          @change="reloadPage"
        />
      </div>

      <div class="grid">
        <TitledPanel>
          <template #header>Skill selection</template>
          <template #content>
            <SkillSelectionChart ref="skillSelection" />
          </template>
        </TitledPanel>
        <TitledPanel>
          <template #header>Skill choices</template>
          <template #content>
            <SkillChoiceChart ref="skillChoice" />
          </template>
        </TitledPanel>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "./statcentral.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref, Watch } from "vue-facing-decorator";
import FumbblApi from "@api/fumbbl";
import VueApexCharts from "vue3-apexcharts";
import MatchesChart from "./charts/matches.vue";
import ActiveCoachesChart from "./charts/activecoaches.vue";
import RosterResultsChart from "./charts/rosterresults.vue";
import WeekdayChart from "./charts/weekday.vue";
import HourChart from "./charts/hour.vue";
import SkillSelectionChart from "./charts/skillselection.vue";
import SkillChoiceChart from "./charts/skillchoice.vue";
import VersusStatsChart from "./charts/versusstats.vue";
import MatchupChart from "./charts/matchup.vue";

import {
  PageHeader,
  TitledPanel,
  Modal,
  Trinary,
  ErrorModal,
  SortableTable,
  Pill,
} from "@components/fumbblcomponents";

@Component({
  components: {
    PageHeader,
    TitledPanel,
    modal: Modal,
    Trinary,
    ErrorModal,
    SortableTable,
    apexchart: VueApexCharts,
    MatchesChart,
    ActiveCoachesChart,
    RosterResultsChart,
    WeekdayChart,
    HourChart,
    SkillSelectionChart,
    SkillChoiceChart,
    VersusStatsChart,
    MatchupChart,
    Pill,
  },
})
class StatCentral extends Vue {
  public fumbblApi!: FumbblApi = new FumbblApi();
  public navItems: any = [
    { label: "Dashboard", page: "dashboard" },
    { label: "Results", page: "results" },
    { label: "Versus", page: "versus" },
    { label: "Skills", page: "skills" },
  ];
  public page: string = "dashboard";

  public dashboardRange: string = "30d";
  public resultsRange: string = "30d";
  public resultsType: string = "all";
  public resultsCtvRange: string = "all";
  public resultsSelectedRoster: string = "All";
  public resultsSelectedPosition: string = "All";
  public resultsMirrors: boolean = true;
  public rostersSelectedYear: string = "All";
  public rostersSelectedMonth: string = "All";
  public rostersIncludeLegacy: boolean = false;
  public rostersSelectedType: string = "all";
  public skillsSelectedRoster: string = "All";
  public skillsSelectedPosition: string = "All";
  public showMatchup: any | null = null;
  public positions: string[] = [];
  public rosterData: { [key: string]: any }[] = [];
  public rawRosters: any = {};

  @Watch("skillsSelectedRoster")
  public onSelectedRosterChange() {
    this.skillsSelectedPosition = "All";
    this.reloadPage();
  }

  @Ref("matchesChart") public matchesChart!: MatchesChart;
  @Ref("activeCoachesChart") public activeCoachesChart!: ActiveCoachesChart;
  @Ref("rosterResultsChart") public rosterResultsChart!: RosterResultsChart;
  @Ref("rosterAnalysisChart") public rosterAnalysisChart!: RosterResultsChart;
  @Ref("weekdayChart") public weekdayChart!: WeekdayChart;
  @Ref("hourChart") public hourChart!: HourChart;
  @Ref("skillSelection") public skillSelection!: SkillSelectionChart;
  @Ref("skillChoice") public skillChoice!: SkillChoiceChart;
  @Ref("versusStats") public versusStats!: VersusStatsChart;
  @Ref("matchupChart") public matchupChart!: MatchupChart;

  public mounted() {
    this.$nextTick(async () => {
      var rosters = await this.fumbblApi.Roster.list(4);
      this.rawRosters = rosters;
      var rosterData = [];

      rosterData.push({
        name: "All",
        label: "All",
        icon: 0,
      });

      for (var i = 0; i < rosters.length; i++) {
        if (rosters[i].playable == "0") {
          continue; // Skip rosters that are not playable
        }
        rosterData.push({
          name: rosters[i].name,
          label: rosters[i].name,
          icon: rosters[i].logos["32"],
        });
      }
      this.rosterData.push(...rosterData);
    });
  }

  public reloadPage() {
    this.setPage(this.page);
  }

  public setPage(page: string) {
    if (this.fumbblApi === undefined) {
      return;
    }
    this.page = page;

    this.$nextTick(() => {
      switch (page) {
        case "dashboard":
          this.loadDashboard();
          break;
        case "results":
          this.loadResults();
          break;
        case "versus":
          this.loadVersusStats();
          break;
        case "skills":
          this.loadSkills();
          break;
      }
    });
  }

  public selectMatchup(match: any) {
    this.fumbblApi.Clickhouse.matchupData(
      match.roster,
      match.opponent,

      this.rostersSelectedYear,
      this.rostersSelectedMonth,
      this.rostersSelectedType,
      this.rostersIncludeLegacy,
    ).then((data: any) => {
      console.log("Matchup data loaded", data);
      this.matchupChart.load(data);
    });
    this.showMatchup = match;
  }

  private loadDashboard() {
    const range = this.dashboardRange || "30d";
    this.fumbblApi.Clickhouse.dashboardData(range).then(
      (dashboardData: any) => {
        this.matchesChart?.load(dashboardData.games.history);
        this.activeCoachesChart.load(dashboardData.coaches);
        this.weekdayChart.load(dashboardData.games.weekday);
        this.hourChart.load(dashboardData.games.hours);
      },
    );
  }

  private loadSkills() {
    const roster =
      this.skillsSelectedRoster !== "All" ? this.skillsSelectedRoster : null;
    const position =
      this.skillsSelectedPosition !== "All"
        ? this.skillsSelectedPosition
        : null;
    this.fumbblApi.Clickhouse.skillSelection(roster, position).then(
      (skillData: any) => {
        this.positions = skillData.positions.map((p) => p.position).sort();
        this.skillSelection.load(skillData.skills);
        this.skillChoice.load(skillData.choices);
      },
    );
  }

  private loadResults() {
    var opts = {
      type: this.resultsType,
      ctvRange: this.resultsCtvRange,
      mirrors: this.resultsMirrors,
    };

    if (this.resultsSelectedRoster !== "All") {
      opts.roster = this.resultsSelectedRoster;
      this.fumbblApi.Clickhouse.rosterResults(this.resultsRange, opts).then(
        (data: any) => {
          this.rosterAnalysisChart.load(data.data);
        },
      );
    } else {
      this.fumbblApi.Clickhouse.competitiveResults(
        this.resultsRange,
        opts,
      ).then((data: any) => {
        this.rosters = data.data.map((r: any) => r.roster1).sort();
        this.rosterAnalysisChart.load(data.data);
      });
    }
  }

  private loadVersusStats() {
    this.fumbblApi.Clickhouse.versusStats(
      this.rostersSelectedYear,
      this.rostersSelectedMonth,
      this.rostersSelectedType,
      this.rostersIncludeLegacy,
    ).then((data: any) => {
      this.versusStats.load(data, this.rawRosters);
    });
    if (this.showMatchup !== null) {
      this.selectMatchup(this.showMatchup);
    }
  }
}

export default toNative(StatCentral);
</script>
