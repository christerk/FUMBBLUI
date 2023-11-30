<template>
  <div class="panelwrapper">
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    <div class="statpanel">
      <div class="teamstatrow header">
        <div class="top"></div>
        <div class="roster">Roster</div>
        <div class="record">Games</div>
        <div class="tds">Touchdowns</div>
        <div class="cas">Casualties</div>
        <div class="tv top">TV</div>
      </div>
      <div class="teamstatrow header">
        <div></div>
        <div class="roster"></div>
        <div class="record small"># (WTL)</div>
        <div class="tds small">For / Agnst</div>
        <div class="cas small">For / Against</div>
        <div class="tv small">Avg TV</div>
      </div>
      <template v-for="stats in statistics" :key="roster">

        <div class="teamstatrow">
          <div><img :src="'https://fumbbl.com/i/'+stats.info.logo" /></div>
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
            {{ stats.tv.for }}
            /
            {{ stats.tv.for }}
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
@import '@pages/team/style/teamstats.less';
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from 'vue-facing-decorator'
import FumbblApi from "../include/FumbblApi";

@Component
class TeamStats extends Vue {
  @Prop
  public team;

  @Prop
  public fumbblApi : FumbblApi;

  @Emit
  public close() {

  }

  private statistics: any = {};

  async mounted() {
  }

  public async loadStats() {
    const apiResponse = await this.fumbblApi.getTeamStats(this.team.id);
    if (apiResponse.isSuccessful()) {
        let stats = apiResponse.getData();

        let list = [];

        Object.keys(stats).forEach(roster => {
          stats[roster].info["roster"] = roster;
          list.push(stats[roster]);
        });

        list.sort((a,b) => {
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

        this.statistics = list;
    } else {
        this.triggerUnexpectedError('Loading team stats: ' + apiResponse.getErrorMessage());
    }    
  }

}

export default toNative(TeamStats);
</script>
