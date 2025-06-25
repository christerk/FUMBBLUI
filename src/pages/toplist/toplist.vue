<template>
  <div class="container toplist" id="vuecontent">
    <PageHeader
      ref="nav"
      :navItems="navItems"
      defaultPage="toplist"
      @setPage="setPage"
    >
      <template #pagename>Top Lists</template>
      <template #center>
        <div class="controls">
          <Pill
            class="row start"
            label="Show"
            type="select"
            :values="[
              { name: 'spp', label: 'Most SPP' },
              { name: 'touchdowns', label: 'Most Touchdowns' },
              { name: 'casualties', label: 'Most Casualties' },
              { name: 'deflections', label: 'Most Deflections' },
              { name: 'interceptions', label: 'Most Interceptions' },
              { name: 'completions', label: 'Most Completions' },
              { name: 'mvps', label: 'Most MVPs' },
              { name: 'blocks', label: 'Most Blocks' },
              { name: 'fouls', label: 'Most Fouls' },
              { name: 'passing', label: 'Highest Passing Yards' },
              { name: 'rushing', label: 'Highest Rushing Yards' },
            ]"
            v-model="stat"
            @change="reloadPage"
          />

          <Pill
            class="row center"
            label="Type"
            :values="[
              { name: 'all', label: 'All Time' },
              { name: 'active', label: 'Active Players' },
              { name: 'retired', label: 'Retired' },
            ]"
            v-model="type"
            @change="reloadPage"
          />

          <Pill
            class="row end"
            label="Division"
            type="select"
            :values="[
              { name: 'all', label: 'All' },
              { name: 'competitive', label: 'Competitive' },
              { name: 'league', label: 'League' },
            ]"
            v-model="division"
            @change="reloadPage"
          />

          <div class="cols2 span-3">
            <Pill
              class="row end"
              type="select"
              label="Roster"
              :values="rosterData"
              v-model="selectedRoster"
            />

            <Pill
              v-show="selectedRoster !== 'all'"
              class="row start"
              label="Position"
              type="select"
              :values="[
                ...positions.map((position) => ({
                  name: position == 'All' ? 'all' : position,
                  label: position,
                })),
              ]"
              v-model="selectedPosition"
              @change="reloadPage"
            />
          </div>
        </div>
      </template>
    </PageHeader>

    <div class="panel" id="toplist" v-if="page == 'toplist'">
      <TitledPanel class="toplist-table">
        <template #header>Top Players</template>
        <template #content>
          <div class="rows">
            <div class="row header">
              <div class="left">Coach</div>
              <div class="left">Team</div>
              <div class="left">Player</div>
              <div class="games">Games</div>
              <div v-if="stat == 'touchdowns'">Touchdowns</div>
              <div v-if="stat == 'completions'">Compiletions</div>
              <div v-if="stat == 'mvps'">MVPs</div>
              <div v-if="stat == 'deflections'">Deflections</div>
              <div v-if="stat == 'interceptions'">Interceptions</div>
              <div v-if="stat == 'casualties'">Casualties</div>
              <div v-if="stat == 'spp'">SPP</div>
              <div v-if="stat == 'blocks'">Blocks</div>
              <div v-if="stat == 'fouls'">Fouls</div>
              <div v-if="stat == 'rushing'">Rushing</div>
              <div v-if="stat == 'passing'">Passing</div>
            </div>
            <div class="row" v-for="player in players" :key="player.id">
              <div class="left">
                <a :href="'~' + encodeURIComponent(player.coach)">{{
                  player.coach
                }}</a>
              </div>
              <div class="left">
                <a :href="'/t/' + player.team_id">{{ player.team }}</a>
              </div>
              <div class="left">
                <a :href="'/p/player?player_id=' + player.player_id">{{
                  player.player
                }}</a>
              </div>
              <div class="games">{{ player.games }}</div>
              <div v-if="stat == 'touchdowns'">
                {{ player.touchdowns }}
              </div>
              <div v-if="stat == 'completions'">
                {{ player.completions }}
              </div>
              <div v-if="stat == 'mvps'">
                {{ player.mvps }}
              </div>
              <div v-if="stat == 'deflections'">
                {{ player.deflections }}
              </div>
              <div v-if="stat == 'interceptions'">
                {{ player.interceptions }}
              </div>
              <div v-if="stat == 'casualties'">
                {{ player.casualties }}
              </div>
              <div v-if="stat == 'spp'">{{ player.spp }}</div>
              <div v-if="stat == 'blocks'">
                {{ player.blocks }}
              </div>
              <div v-if="stat == 'fouls'">
                {{ player.fouls }}
              </div>
              <div v-if="stat == 'rushing'">
                {{ player.rushing }}
              </div>
              <div v-if="stat == 'passing'">
                {{ player.passing }}
              </div>
            </div>
          </div>
        </template>
      </TitledPanel>
    </div>
  </div>
</template>

<style scoped>
@import "./toplist.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref, Watch } from "vue-facing-decorator";
import FumbblApi from "@api/fumbbl";

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
    Pill,
  },
})
class TopList extends Vue {
  public fumbblApi!: FumbblApi = new FumbblApi();
  public navItems: any = [];
  public page: string = "dashboard";

  public stat: string = "spp";
  public type: string = "active";
  public division: string = "all";
  public selectedRoster: string = "all";
  public selectedPosition: string = "all";

  public rosterData: Array<{ name: string; label: string; id: string }> = [];
  public rosterCache: { [key: string]: any } = {};
  public positions: string[] = [];

  public players: any[] = [];

  @Watch("selectedRoster")
  public onSelectedRosterChange() {
    this.selectedPosition = "all";
    this.reloadPositions();
    this.reloadPage();
  }

  public async mounted() {
    var rosters = await this.fumbblApi.Roster.list(4);
    var rosterData = [];

    rosterData.push({
      name: "all",
      label: "All",
      icon: 0,
    });

    for (var i = 0; i < rosters.length; i++) {
      if (rosters[i].playable == "0") {
        continue; // Skip rosters that are not playable
      }
      rosterData.push({
        id: rosters[i].id,
        name: rosters[i].id,
        label: rosters[i].name,
        icon: rosters[i].logos["32"],
      });
      this.rosterCache[rosters[i].id] = rosters[i];
    }
    this.rosterCache["All"] = "all";
    rosterData.sort((a, b) => a.label.localeCompare(b.label));
    this.rosterData.push(...rosterData);
  }

  public async reloadPositions() {
    if (this.selectedRoster === "all") {
      this.positions = [];
      return;
    }

    var roster = await this.fumbblApi.Roster.getRoster(this.selectedRoster);
    if (roster === undefined) {
      this.positions = [];
      return;
    }

    const rosterPositions = roster.positions
      .map((p: any) => p.title)
      .sort((a, b) => a.localeCompare(b));

    this.positions = ["All", ...rosterPositions];
  }

  public reloadPage() {
    this.setPage(this.page);
  }

  public setPage(page: string) {
    if (this.fumbblApi === undefined) {
      return;
    }
    this.page = page;

    switch (page) {
      case "toplist":
        this.loadToplist();
        break;
    }
  }

  private async loadToplist() {
    const roster =
      this.selectedRoster == "all"
        ? "all"
        : this.rosterCache[this.selectedRoster].name;

    const data = await this.fumbblApi.Clickhouse.topList(
      this.stat,
      this.type,
      this.division,
      roster,
      this.selectedPosition,
    );

    this.players = data.data;
  }
}

export default toNative(TopList);
</script>
