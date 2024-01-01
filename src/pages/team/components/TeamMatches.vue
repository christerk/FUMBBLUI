<template>
  <div class="panelwrapper">
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    <div class="matchpanel">
      <div class="match title">
        <div>Date</div>
        <div style="grid-column: 2/4">Score</div>
        <div style="grid-column: 4/6">Opponent</div>
        <div>TV</div>
        <div style="grid-column: 7/9">Cas</div>
      </div>
      <template v-for="match in matches" :key="match.id">
        <a class="match" :href="matchUrl(match.id)">
          <div>{{ match.date }}</div>
          <template v-if="match.team1.id == team.id">
            <div>{{ match.team1.score }} - {{ match.team2.score }}</div>
            <div>
              {{
                match.team2.score < match.team1.score
                  ? "Win"
                  : match.team2.score > match.team1.score
                  ? "Loss"
                  : "Tie"
              }}
            </div>
            <div class="left">{{ match.team2.roster }}</div>
            <div class="left">
              <a :href="teamUrl(match.team2.id)">{{ match.team2.name }}</a>
            </div>
            <div>{{ match.team1.teamValue }}</div>
            <div>
              {{ match.team1.casualties.bh }} /
              {{ match.team1.casualties.si }} / {{ match.team1.casualties.rip }}
            </div>
            <div>
              {{ match.team2.casualties.bh }} /
              {{ match.team2.casualties.si }} / {{ match.team2.casualties.rip }}
            </div>
          </template>
          <template v-else>
            <div>{{ match.team2.score }} - {{ match.team1.score }}</div>
            <div>
              {{
                match.team1.score < match.team2.score
                  ? "Win"
                  : match.team1.score > match.team2.score
                  ? "Loss"
                  : "Tie"
              }}
            </div>
            <div class="left">{{ match.team1.roster }}</div>
            <div class="left">
              <a :href="teamUrl(match.team1.id)">{{ match.team1.name }}</a>
            </div>
            <div>{{ match.team1.teamValue }}</div>
            <div>
              {{ match.team2.casualties.bh }} /
              {{ match.team2.casualties.si }} / {{ match.team2.casualties.rip }}
            </div>
            <div>
              {{ match.team1.casualties.bh }} /
              {{ match.team1.casualties.si }} / {{ match.team1.casualties.rip }}
            </div>
          </template>
        </a>
      </template>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/teammatches.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";

@Component
class TeamMatches extends Vue {
  private matches: any = [];

  @Prop
  public team;

  @Prop
  public fumbblApi: FumbblApi;

  @Emit
  public close() {}

  @Emit("unexpected-error")
  public triggerUnexpectedError(errorMessage: string): string {
    return errorMessage;
  }

  private statistics: any = {};

  async mounted() {}

  public async loadMatches() {
    const apiResponse = await this.fumbblApi.getTeamMatches(this.team.id);
    if (apiResponse.isSuccessful()) {
      this.matches = apiResponse.getData();
    } else {
      this.triggerUnexpectedError(
        "Loading team matches: " + apiResponse.getErrorMessage(),
      );
    }
  }

  private teamUrl(id: number) {
    return "https://fumbbl.com/p/team?team_id=" + id;
  }

  private matchUrl(id: number) {
    return "https://fumbbl.com/p/match?id=" + id;
  }
}

export default toNative(TeamMatches);
</script>
