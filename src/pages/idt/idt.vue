<template>
  <div class="container" id="vuecontent">
    <PageHeader
      ref="nav"
      :navItems="navItems"
      defaultPage="standings"
      @setPage="setPage"
    >
      <template #pagename
        >IRONDWARF Trophy
        <SeasonPicker
          :seasons="seasons"
          :selectedSeason="selectedSeason"
          @changeSeason="loadSeasonData"
        ></SeasonPicker>
      </template>
      <template #center>
        <Progress ref="progress" :season="selectedSeason"></Progress>
      </template>
    </PageHeader>

    <div
      class="panel"
      id="rules"
      v-if="page == 'rules' && selectedSeason != null"
    >
      <TitledPanel>
        <template #header>Rules</template>
        <template #content>
          <div class="rules">
            <p>
              The Iron Dwarf Trophy is a meta-event in the Competitive division.
              Each season, coaches create teams and play these using the
              Blackbox scheduler.
            </p>

            <p>
              At the end of a season, the winner is the team who managed to get
              the highest total score.
            </p>
            <div class="twocolumn">
              <div class="column">
                <div class="section">Restrictions</div>
                <ul class="scorelist">
                  <li class="item">
                    Teams must use the Blackbox scheduler, or in official
                    tournaments. If a match is played outside of these
                    environments, their score is frozen.
                  </li>
                  <li class="item">
                    Teams are active in the trophy until they have hit three
                    losses. A tie counts as half a loss for this purpose.
                  </li>
                  <li class="item">
                    When a team is no longer active, their score is frozen for
                    the rest of the season.
                  </li>
                  <li class="item">
                    As opposed to the Blackbox Trophy, any number of attempts
                    can be made within a season.
                  </li>
                </ul>
              </div>
              <div class="column">
                <div class="section">Scoring</div>
                <ul class="scorelist">
                  <li class="item">
                    The score for a team is equal to the number of wins they
                    have.
                  </li>
                  <li class="item">
                    In case of equal number of wins, the number of ties are used
                    as a tie-breaker.
                  </li>
                  <li class="item">
                    Teams with the same wins and ties share their position on
                    the leaderboard.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="standings" v-if="page == 'standings'">
      <div class="toolbar">
        <select :value="teamFilter" @change="changeTeamStandingFilter($event)">
          <option value="All">All Teams</option>
          <option value="My">My Teams</option>
          <option disabled="true">---</option>
          <option>Amazon</option>
          <option>Black Orc</option>
          <option>Chaos Chosen</option>
          <option>Chaos Dwarf</option>
          <option>Chaos Renegade</option>
          <option>Dark Elf</option>
          <option>Dwarf</option>
          <option>Elven Union</option>
          <option>Gnome</option>
          <option>Goblin</option>
          <option>Halfling</option>
          <option>High Elf</option>
          <option>Human</option>
          <option>Imperial Nobility</option>
          <option>Khorne</option>
          <option>Lizardmen</option>
          <option>Necromantic Horror</option>
          <option>Norse</option>
          <option>Nurgle</option>
          <option>Ogre</option>
          <option>Old World Alliance</option>
          <option>Orc</option>
          <option>Shambling Undead</option>
          <option>Skaven</option>
          <option>Snotling</option>
          <option>Tomb Kings</option>
          <option>Underworld Denizens</option>
          <option>Vampire</option>
          <option>Wood Elf</option>
        </select>
      </div>
      <TitledPanel>
        <template #header> Standings - Top 100 </template>
        <template #content>
          <table>
            <thead>
              <tr class="columns">
                <th>&nbsp;</th>
                <th>Coach</th>
                <th>Roster</th>
                <th>Team</th>
                <th class="right" width="10%">Wins</th>
                <th class="right" width="10%">Ties</th>
                <th class="right" width="10%">Losses</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="team in visibleTeams(teams)" :key="team.id">
                <tr :class="{ team: true, self: team.coach == coachName }">
                  <td class="right">{{ team.ranking }}.</td>
                  <td>
                    <a :href="coachLink(team.coach)">{{ team.coach }}</a>
                  </td>
                  <td class="roster">
                    <img :src="'https://fumbbl.com/i/' + team.logo" />{{
                      team.roster
                    }}
                  </td>
                  <td class="teamName">
                    <a :href="teamLink(team)">{{ team.team }}</a>
                  </td>
                  <td class="right">
                    <span class="frozen" v-if="isFrozen(team)">&#x2744;</span>
                    <span class="trophy" v-if="hasTrophy(team)">&#x1F3C6;</span>
                    {{ team.wins.toFixed(0) }}
                  </td>
                  <td class="right">{{ team.ties.toFixed(0) }}</td>
                  <td class="right">{{ team.losses.toFixed(0) }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="trophies" v-if="page == 'trophies'">
      <TitledPanel>
        <template #header> Trophies </template>
        <template #content>
          <div class="section">
            Rosters
            <span class="description"
              >Reach 10 wins with a roster to unlock</span
            >
          </div>
          <div id="seasonRosters">
            <template v-for="roster in rosters" :key="roster">
              <img
                v-if="roster.playable == 1"
                :title="roster.name"
                :class="{ achieved: hasAchieved(roster.name) }"
                :src="'https://fumbbl.com/i/' + roster.logos[96]"
              />
            </template>
          </div>
        </template>
      </TitledPanel>
    </div>
  </div>
</template>

<style scoped>
@import "./idt.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref } from "vue-facing-decorator";
import Progress from "../boxtrophy/progress.vue";
import FumbblApi from "../team/include/FumbblApi";
import SeasonPicker from "../boxtrophy/seasonpicker.vue";

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
    Progress,
    SeasonPicker,
  },
})
class Idt extends Vue {
  public navItems: any = [
    { label: "Rules", page: "rules" },
    { label: "Trophies", page: "trophies" },
    { label: "Standings", page: "standings" },
  ];
  public seasons: any = [];
  public selectedSeason: any = null;
  private fumbblApi: FumbblApi | null = null;
  public seasonData: any = null;
  public nextCostUp: number = 0;
  public nextCostDown: number = 99;
  public page: string = "";
  public teamFilter = "All";
  public teams: any[] = [];

  public rosters: any[] = [];
  private achieved: string[] = [];

  @Ref
  public progress: any;

  hasFutureSeason: boolean = false;
  coachName: string | null = null;

  public async mounted() {
    this.fumbblApi = new FumbblApi();

    this.coachName = document
      .getElementsByClassName("idtpage")[0]
      .getAttribute("coach");

    this.$nextTick(async () => {

      let requestSeason = parseInt(document
      .getElementsByClassName("idtpage")[0]
      .getAttribute("season") ?? "0");

      let season = await this.fumbblApi?.getSeasonConfig(0);
      await this.loadSeasons();

      if (requestSeason > 0) {
        season = this.seasons.find((s:any) => s.season == requestSeason);
      }
      await this.loadSeasonData(season);

      if (window.location.hash && window.location.hash.length > 0) {
        const c = window.location.hash.substring(1);
        this.setPage(c);
      } else {
        this.setPage(this.page);
      }
    });

    this.rosters = (await this.fumbblApi.getRosters(4)).data;
  }

  public async loadSeasonData(season: any) {
    var seasonConfig = await this.fumbblApi?.getSeason(season.season);

    var seasonData: any = {};

    var data: any[] = seasonConfig?.data;

    this.nextCostUp = 0;
    this.nextCostDown = 99;

    for (var roster of data) {
      var tier = roster.tier;
      var cost = roster.cost;
      if (cost >= this.nextCostUp) {
        this.nextCostUp = cost + 1;
      }
      if (cost <= this.nextCostDown) {
        this.nextCostDown = cost - 1;
      }
      var rosterName = roster.roster;
      var id = roster.id;
      var logo = roster.logo;

      if (!("Tier" + tier in seasonData)) {
        seasonData["Tier" + tier] = {
          tier: tier,
          cost: cost,
          rosters: [],
        };
      }

      seasonData["Tier" + tier].rosters.push({
        roster: rosterName,
        id: id,
        logo: logo,
      });
    }

    this.seasonData = seasonData;
    this.selectedSeason = season;
    this.loadStandings();
  }

  public setPage(newPage: string) {
    if (newPage == this.page) {
      //return;
    }

    switch (newPage) {
      case "rules":
        break;
      case "trophies":
        break;
      case "standings":
        break;
      default:
        break;
    }

    this.page = newPage;
  }

  public async loadSeasons() {
    if (this.fumbblApi) {
      var seasons = await this.fumbblApi.getSeasons();
      this.seasons = seasons.data;

      this.hasFutureSeason = !seasons.data[seasons.data.length - 1].isActive;
      return true;
    }
    return false;
  }

  public changeTeamStandingFilter(event: any) {
    this.teamFilter = event.target.value;
    this.loadStandings();
  }

  public async loadStandings(loadAllOwn = false) {
    let teamStandings = await this.fumbblApi?.getSeasonIdtStandings(
      this.selectedSeason.season,
      loadAllOwn,
    );

    this.teams = teamStandings?.data.teams ?? [];
    this.achieved = teamStandings?.data.achieved ?? [];
  }

  public getPosition(team: any) {
    return (
      this.teams
        .filter(this.showTeam)
        .filter(
          (t) =>
            t.wins > team.wins || (t.wins == team.wins && t.ties > team.ties),
        ).length + 1
    );
  }

  public teamLink(team: any) {
    return "/t/" + team.id;
  }
  public coachLink(coach: string) {
    return "/~" + encodeURIComponent(coach);
  }
  public visibleTeams(teams: any[]) {
    return teams
      .filter(this.showTeam)
      .sort((a, b) => (a.wins != b.wins ? b.wins - a.wins : b.ties - a.ties));
  }
  public showTeam(team: any) {
    var result =
      this.teamFilter == "All" ||
      (this.teamFilter == "My" && team.coach == this.coachName) ||
      this.teamFilter == team.roster;

    return result;
  }

  public hasAchieved(roster: string) {
    return this.achieved.includes(roster);
  }

  public isFrozen(team: any): boolean {
    return team.state == "frozen" || (team.losses + team.ties / 2 >= 3);
  }
  public hasTrophy(team: any): boolean {
    return team.wins >= 10;
  }
}

export default toNative(Idt);
</script>
