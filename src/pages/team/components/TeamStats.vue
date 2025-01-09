<template>
  <div class="panelwrapper">
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    <div class="statpanel">
      <div class="teamstatrow panelheader">
        <div class="top"></div>
        <div class="roster">Roster</div>
        <div class="record">Games</div>
        <div class="tds">Touchdowns</div>
        <div class="cas">Casualties</div>
        <div class="tv top">CTV</div>
      </div>
      <div class="teamstatrow panelheader">
        <div></div>
        <div class="roster"></div>
        <div class="record small"># (WTL)</div>
        <div class="tds small">For / Against</div>
        <div class="cas small">For / Against</div>
        <div class="tv small">Avg CTV</div>
      </div>
      <template v-for="stats in statistics" :key="stats.info.roster">
        <div class="teamstatrow panelcontent">
          <div><img :src="'https://fumbbl.com/i/' + stats.info.logo" /></div>
          <div class="roster">{{ stats.info.roster }}</div>
          <div>
            {{ stats.record.games }}
            (
            {{ stats.record.wins }}
            /
            {{ stats.record.ties }}
            /
            {{ stats.record.losses }}
            )
          </div>

          <div>
            {{ stats.td.for }}
            /
            {{ stats.td.against }}
          </div>

          <div>
            {{ stats.cas.for.bh }}
            /
            {{ stats.cas.for.si }}
            /
            {{ stats.cas.for.kill }}
          </div>

          <div>
            {{ stats.cas.against.bh }}
            /
            {{ stats.cas.against.si }}
            /
            {{ stats.cas.against.kill }}
          </div>

          <div>
            {{ Math.round(stats.tv.for / 1000) }}k /
            {{ Math.round(stats.tv.against / 1000) }}k
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/teamstats.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import Team from "../include/Team";

@Component
class TeamStats extends Vue {
  @Prop({
    required: true,
  })
  public team!: Team;

  @Prop({
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Emit
  public close() {}

  @Emit("unexpected-error")
  public triggerUnexpectedError(errorMessage: string): string {
    return errorMessage;
  }

  public statistics: any = {};

  async mounted() {}

  public async loadStats() {
    let summaryRow = {
      info: { roster: "Summary", logo: 735926 },
      record: { games: 0, wins: 0, ties: 0, losses: 0 },
      td: { for: 0, against: 0 },
      cas: {
        for: { bh: 0, si: 0, kill: 0 },
        against: { bh: 0, si: 0, kill: 0 },
      },
      tv: { for: 0, against: 0 },
    };

    const apiResponse = await this.fumbblApi.getTeamStats(this.team.id);
    if (apiResponse.isSuccessful()) {
      let stats = apiResponse.getData();

      let list: any[] = [];

      Object.keys(stats).forEach((roster) => {
        stats[roster].info["roster"] = roster;
        list.push(stats[roster]);
        summaryRow["record"]["games"] += stats[roster]["record"]["games"];
        summaryRow["record"]["wins"] += stats[roster]["record"]["wins"];
        summaryRow["record"]["ties"] += stats[roster]["record"]["ties"];
        summaryRow["record"]["losses"] += stats[roster]["record"]["losses"];

        summaryRow["td"]["for"] += stats[roster]["td"]["for"];
        summaryRow["td"]["against"] += stats[roster]["td"]["against"];

        summaryRow["cas"]["for"]["bh"] += stats[roster]["cas"]["for"]["bh"];
        summaryRow["cas"]["for"]["si"] += stats[roster]["cas"]["for"]["si"];
        summaryRow["cas"]["for"]["kill"] += stats[roster]["cas"]["for"]["kill"];
        summaryRow["cas"]["against"]["bh"] +=
          stats[roster]["cas"]["against"]["bh"];
        summaryRow["cas"]["against"]["si"] +=
          stats[roster]["cas"]["against"]["si"];
        summaryRow["cas"]["against"]["kill"] +=
          stats[roster]["cas"]["against"]["kill"];

        summaryRow["tv"]["for"] +=
          stats[roster]["tv"]["for"] * stats[roster]["record"]["games"];
        summaryRow["tv"]["against"] +=
          stats[roster]["tv"]["against"] * stats[roster]["record"]["games"];
      });

      if (summaryRow["record"]["games"] > 0) {
        summaryRow["tv"]["for"] /= summaryRow["record"]["games"];
        summaryRow["tv"]["against"] /= summaryRow["record"]["games"];
      }

      list.sort((a, b) => {
        let d = b.record.games - a.record.games;
        if (d != 0) return d;

        d = b.record.wins - a.record.wins;
        if (d != 0) return d;

        d = b.record.ties - a.record.ties;
        if (d != 0) return d;

        d = b.td.for - a.td.for;
        if (d != 0) return d;

        return 0;
      });

      list.push(summaryRow);

      this.statistics = list;
    } else {
      this.triggerUnexpectedError(
        "Loading team stats: " + apiResponse.getErrorMessage(),
      );
    }
  }
}

export default toNative(TeamStats);
</script>
