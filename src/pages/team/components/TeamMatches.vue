<template>
  <div class="panelwrapper">
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    <div class="matchpanel">
      <div class="title">Match History</div>
      <template v-for="match in matches" :key="match.id">
        <a class="match" :href="matchUrl(match.id)">
          <div class="matchscore">
            <span :class="{ bold: match.team1.score > match.team2.score }">{{
              match.team1.score
            }}</span>
            -
            <span :class="{ bold: match.team1.score < match.team2.score }">{{
              match.team2.score
            }}</span>
          </div>
          <div class="matchowncoach">
            ({{ match.team1.coach.cr }})
            <a :href="coachUrl(match.team1.coach.name)">{{
              match.team1.coach.name
            }}</a>
          </div>
          <div class="matchoppcoach">
            <a :href="coachUrl(match.team2.coach.name)">{{
              match.team2.coach.name
            }}</a>
            ({{ match.team2.coach.cr }})
          </div>
          <div class="matchownteam">
            <a :href="teamUrl(match.team2.id)">{{ match.team1.name }}</a>
          </div>
          <div class="matchoppteam">
            <a :href="teamUrl(match.team2.id)">{{ match.team2.name }}</a>
          </div>
          <div class="matchownroster">
            TV {{ match.team1.teamValue }} {{ match.team1.roster }}
          </div>
          <div class="matchopproster">
            {{ match.team2.roster }} TV {{ match.team2.teamValue }}
          </div>
          <div class="matchownlogo">
            <img :src="'https://fumbbl.com/i/' + match.team1.logo" />
          </div>
          <div class="matchopplogo">
            <img :src="'https://fumbbl.com/i/' + match.team2.logo" />
          </div>
        </a>
      </template>
      <div
        v-if="showMoreButton && matches.length < team.record.games"
        class="morematches"
      >
        <button @click="loadMoreMatches" class="morebutton">Load More</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/teammatches.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import Team from "../include/Team";

@Component
class TeamMatches extends Vue {
  public matches: any = [];
  public showMoreButton: boolean = true;

  @Prop({ required: true })
  public team!: Team;

  @Prop
  public fumbblApi!: FumbblApi;

  @Emit
  public close() {}

  @Emit("unexpected-error")
  public triggerUnexpectedError(errorMessage: string): string {
    return errorMessage;
  }

  private statistics: any = {};

  async mounted() {}

  public async loadMatches(lastId: number = 0) {
    const apiResponse = await this.fumbblApi.getTeamMatches(
      this.team.id,
      lastId,
    );
    if (apiResponse.isSuccessful()) {
      let loadedMatches = this.flipMatches(apiResponse.getData());
      if (lastId == 0) {
        this.matches = loadedMatches;
      } else {
        this.matches = this.matches.concat(loadedMatches);
      }
    } else {
      this.triggerUnexpectedError(
        "Loading team matches: " + apiResponse.getErrorMessage(),
      );
    }
  }

  public async loadMoreMatches() {
    this.showMoreButton = false;
    await this.loadMatches(this.matches.at(-1).id - 1);
    this.showMoreButton = true;
  }

  private flipMatches(matches: any[]) {
    let result:any[] = [];

    matches.forEach((match) => {
      if (match.team1.id != this.team.id) {
        let t1 = match.team1;
        match.team1 = match.team2;
        match.team2 = t1;
      }
      result.push(match);
    });
    return result;
  }

  public teamUrl(id: number) {
    return "https://fumbbl.com/p/team?team_id=" + id;
  }

  public matchUrl(id: number) {
    return "https://fumbbl.com/p/match?id=" + id;
  }
  public coachUrl(coach: string) {
    return "https://fumbbl.com/~" + encodeURI(coach);
  }
}

export default toNative(TeamMatches);
</script>
