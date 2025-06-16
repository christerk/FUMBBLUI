<template>
  <div class="container statcentral" id="vuecontent">
    <PageHeader
      ref="nav"
      :navItems="navItems"
      defaultPage="dashboard"
      @setPage="setPage"
    >
      <template #pagename>Statistics Central </template>
      <template #center> </template>
    </PageHeader>

    <div class="panel" id="dashboard" v-if="page == 'dashboard'">
      <div class="description">
        <div>
          <button class="pill label">Time Period</button>
          <button
            :class="{ pill: true, active: range == '30d' }"
            @click="setRange('30d')"
          >
            30 days
          </button>
          <button
            :class="{ pill: true, active: range == '30w' }"
            @click="setRange('30w')"
          >
            30 weeks
          </button>
          <button
            :class="{ pill: true, active: range == '30m' }"
            @click="setRange('30m')"
          >
            30 months
          </button>
          <button
            :class="{ pill: true, active: range == '30q' }"
            @click="setRange('30q')"
          >
            30 quarters
          </button>
          <button
            :class="{ pill: true, active: range == 'all' }"
            @click="setRange('all')"
          >
            All
          </button>
        </div>
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
        <div class="row span3 start">
          <button class="pill label">Time Period</button>
          <button
            :class="{ pill: true, active: range == '30d' }"
            @click="loadResults('30d', type, ctvRange, mirrors)"
          >
            30 days
          </button>
          <button
            :class="{ pill: true, active: range == '30w' }"
            @click="loadResults('30w', type, ctvRange, mirrors)"
          >
            30 weeks
          </button>
          <button
            :class="{ pill: true, active: range == '30m' }"
            @click="loadResults('30m', type, ctvRange, mirrors)"
          >
            30 months
          </button>
          <button
            :class="{ pill: true, active: range == '30q' }"
            @click="loadResults('30q', type, ctvRange, mirrors)"
          >
            30 quarters
          </button>
          <button
            :class="{ pill: true, active: range == 'all' }"
            @click="loadResults('all', type, ctvRange, mirrors)"
          >
            All
          </button>
        </div>
        <div class="row span3 end">
          <button class="pill label">Match Type</button>
          <button
            :class="{ pill: true, active: type == 'all' }"
            @click="loadResults(range, 'all', ctvRange, mirrors)"
          >
            Combined
          </button>
          <button
            :class="{ pill: true, active: type == 'open' }"
            @click="loadResults(range, 'open', ctvRange, mirrors)"
          >
            Open
          </button>
          <button
            :class="{ pill: true, active: type == 'blackbox' }"
            @click="loadResults(range, 'blackbox', ctvRange, mirrors)"
          >
            Blackbox
          </button>
        </div>
        <div class="row span2 start">
          <button class="pill label">CTV Range</button>

          <button
            :class="{ pill: true, active: ctvRange == 'all' }"
            @click="loadResults(range, type, 'all', mirrors)"
          >
            All
          </button>
          <button
            :class="{ pill: true, active: ctvRange == 'low' }"
            @click="loadResults(range, type, 'low', mirrors)"
          >
            &lt; 1300k
          </button>
          <button
            :class="{ pill: true, active: ctvRange == 'mid' }"
            @click="loadResults(range, type, 'mid', mirrors)"
          >
            1300k - 1500k
          </button>
          <button
            :class="{ pill: true, active: ctvRange == 'high' }"
            @click="loadResults(range, type, 'high', mirrors)"
          >
            &gt; 1500k
          </button>
        </div>
        <div class="row span2">
          <button class="pill label">Mirrors</button>
          <button
            :class="{ pill: true, active: mirrors == true }"
            @click="loadResults(range, type, ctvRange, true)"
          >
            Yes
          </button>
          <button
            :class="{ pill: true, active: mirrors == false }"
            @click="loadResults(range, type, ctvRange, false)"
          >
            No
          </button>
        </div>
        <div class="row span2 end">
          <button class="pill label">Roster</button>
          <select v-model="selectedRoster" @change="rosterChanged" class="pill">
            <option>All</option>
            <template v-for="roster in rosters" :key="roster">
              <option :value="roster">
                {{ roster }}
              </option>
            </template>
          </select>
        </div>
      </div>
      <TitledPanel class="roster-results">
        <template #header>Roster Results</template>
        <template #content>
          <RosterResultsChart ref="rosterAnalysisChart" />
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="rosters" v-if="page == 'rosters'">
      <div class="description">Not implemented yet</div>
    </div>

    <div class="panel" id="skills" v-if="page == 'skills'">
      <div class="description cols2">
        <div class="row end">
          <button class="pill label">Roster</button>
          <select
            v-model="selectedRoster"
            @change="updateRoster()"
            class="pill"
          >
            <option>All</option>
            <template v-for="roster in rosters" :key="roster">
              <option :value="roster">
                {{ roster }}
              </option>
            </template>
          </select>
        </div>

        <div class="row start" v-show="selectedRoster !== 'All'">
          <button class="pill label">Position</button>
          <select
            v-model="selectedPosition"
            @change="loadSkills()"
            class="pill"
          >
            <option>All</option>
            <template v-for="position in positions" :key="position">
              <option :value="position">
                {{ position }}
              </option>
            </template>
          </select>
        </div>
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
import { Component, Vue, toNative, Ref } from "vue-facing-decorator";
import FumbblApi from "@api/fumbbl";
import VueApexCharts from "vue3-apexcharts";
import MatchesChart from "./charts/matches.vue";
import ActiveCoachesChart from "./charts/activecoaches.vue";
import RosterResultsChart from "./charts/rosterresults.vue";
import WeekdayChart from "./charts/weekday.vue";
import HourChart from "./charts/hour.vue";
import SkillSelectionChart from "./charts/skillselection.vue";
import SkillChoiceChart from "./charts/skillchoice.vue";

import {
  PageHeader,
  TitledPanel,
  Modal,
  Trinary,
  ErrorModal,
  SortableTable,
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
  },
})
class StatCentral extends Vue {
  public fumbblApi!: FumbblApi = new FumbblApi();
  public navItems: any = [
    { label: "Dashboard", page: "dashboard" },
    { label: "Results", page: "results" },
    { label: "Rosters", page: "rosters" },
    { label: "Skills", page: "skills" },
  ];
  public page: string = "dashboard";

  public range: string = "30d";
  public type: string = "all";
  public ctvRange: string = "all";
  public selectedRoster: string = "All";
  public selectedPosition: string = "All";
  public mirrors: boolean = true;

  public rosters: string[] = [];
  public positions: string[] = [];

  @Ref("matchesChart") public matchesChart!: MatchesChart;
  @Ref("activeCoachesChart") public activeCoachesChart!: ActiveCoachesChart;
  @Ref("rosterResultsChart") public rosterResultsChart!: RosterResultsChart;
  @Ref("rosterAnalysisChart") public rosterAnalysisChart!: RosterResultsChart;
  @Ref("weekdayChart") public weekdayChart!: WeekdayChart;
  @Ref("hourChart") public hourChart!: HourChart;
  @Ref("skillSelection") public skillSelection!: SkillSelectionChart;
  @Ref("skillChoice") public skillChoice!: SkillChoiceChart;

  public async mounted() {}

  public setPage(page: string) {
    if (this.fumbblApi === undefined) {
      return;
    }
    this.page = page;

    switch (page) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "results":
        this.loadResults();
        break;
      case "skills":
        this.loadSkills();
        break;
    }
  }

  public setRange(range: string) {
    this.range = range;
    this.loadDashboard(range);
  }

  private loadDashboard(range: string = "30d") {
    this.fumbblApi.Clickhouse.dashboardData(range).then(
      (dashboardData: any) => {
        this.matchesChart.load(dashboardData.games.history);
        this.activeCoachesChart.load(dashboardData.coaches);
        this.weekdayChart.load(dashboardData.games.weekday);
        this.hourChart.load(dashboardData.games.hours);
      },
    );
  }

  private updateRoster() {
    this.selectedPosition = "All";
    this.loadSkills();
  }

  private loadSkills() {
    const roster = this.selectedRoster !== "All" ? this.selectedRoster : null;
    const position =
      this.selectedPosition !== "All" ? this.selectedPosition : null;
    this.fumbblApi.Clickhouse.skillSelection(roster, position).then(
      (skillData: any) => {
        this.rosters = skillData.rosters.map((r) => r.roster).sort();
        this.positions = skillData.positions.map((p) => p.position).sort();
        this.skillSelection.load(skillData.skills);
        this.skillChoice.load(skillData.choices);
      },
    );
  }

  private loadResults(
    range: string = "30d",
    type: string = "all",
    ctvRange: string = "all",
    mirrors: boolean = true,
  ) {
    this.range = range;
    this.type = type;
    this.ctvRange = ctvRange;
    this.mirrors = mirrors;

    var opts = {
      type: this.type,
      ctvRange: this.ctvRange,
      mirrors: this.mirrors,
    };

    if (this.selectedRoster !== "All") {
      opts.roster = this.selectedRoster;
      this.fumbblApi.Clickhouse.rosterResults(this.range, opts).then(
        (data: any) => {
          this.rosterAnalysisChart.load(data.data);
        },
      );
    } else {
      this.fumbblApi.Clickhouse.competitiveResults(this.range, opts).then(
        (data: any) => {
          this.rosters = data.data.map((r: any) => r.roster1).sort();
          this.rosterAnalysisChart.load(data.data);
        },
      );
    }
  }

  private rosterChanged() {
    this.loadResults(this.range, this.type, this.ctvRange);
    this.selectedPosition = "All";
  }
}

export default toNative(StatCentral);
</script>
