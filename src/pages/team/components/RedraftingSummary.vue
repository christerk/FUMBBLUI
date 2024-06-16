<template>
  <div class="wrapper">
    <div class="section">
      <div class="title">Re-drafting budget</div>
      <div class="value">
        {{ team.getRedraftLimits().budget / 1000 }}k
        <div class="infolink" @click.prevent="showRedraftInfo = true">?</div>
      </div>
    </div>
    <div class="section op">-</div>
    <div class="section">
      <div class="title">Player (re-)hiring cost</div>
      <div class="value">{{ team.getTotalPlayerRedraftingCost() / 1000 }}k</div>
    </div>
    <div class="section op">-</div>
    <div class="section">
      <div class="title">Team staff cost</div>
      <div class="value">{{ team.getTotalStaffCost(false) / 1000 }}k</div>
    </div>
    <div class="section op">=</div>
    <div class="section">
      <div class="title">Remaining Budget</div>
      <div class="value">{{ getRemainingBudget() / 1000 }}k</div>
    </div>
    <div class="message">{{ getMessage() }}</div>
  </div>

  <modal
    v-show="showRedraftInfo"
    modalSize="'medium'"
    :exclude-header="false"
    :exclude-buttons="true"
    @cancel="showRedraftInfo = false"
  >
    <template v-slot:header> Redrafting budget calculation </template>

    <template v-slot:body>
      <div class="budget">
        <div class="line">
          <div class="label">Base</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftInfo().base / 1000 }}k</div>
        </div>
        <div class="line">
          <div class="label">Treasury</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftLimits().treasury / 1000 }}k</div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerGame > 0">
          <div class="label">Games</div>
          <div class="val">
            {{ team.seasonInfo.gamesPlayedInCurrentSeason }}
          </div>
          <div class="val">
            x{{ team.getRedraftInfo().goldPerGame / 1000 }}k
          </div>
          <div class="sum">
            {{
              (team.seasonInfo.gamesPlayedInCurrentSeason *
                team.getRedraftInfo().goldPerGame) /
              1000
            }}k
          </div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerWin > 0">
          <div class="label">Wins</div>
          <div class="val">{{ team.seasonInfo.wins }}</div>
          <div class="val">x{{ team.getRedraftInfo().goldPerWin / 1000 }}k</div>
          <div class="sum">
            {{
              (team.seasonInfo.wins * team.getRedraftInfo().goldPerWin) / 1000
            }}k
          </div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerTie > 0">
          <div class="label">Ties</div>
          <div class="val">{{ team.seasonInfo.ties }}</div>
          <div class="val">x{{ team.getRedraftInfo().goldPerTie / 1000 }}k</div>
          <div class="sum">
            {{
              (team.seasonInfo.ties * team.getRedraftInfo().goldPerTie) / 1000
            }}k
          </div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerLoss > 0">
          <div class="label">Losses</div>
          <div class="val">{{ team.seasonInfo.losses }}</div>
          <div class="val">
            x{{ team.getRedraftInfo().goldPerLoss / 1000 }}k
          </div>
          <div class="sum">
            {{
              (team.seasonInfo.losses * team.getRedraftInfo().goldPerLoss) /
              1000
            }}k
          </div>
        </div>
        <div class="line summary">
          <div class="label">Budget</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">
            {{
              (team.getRedraftInfo().base +
                team.getRedraftLimits().treasury +
                team.seasonInfo.gamesPlayedInCurrentSeason *
                  team.getRedraftInfo().goldPerGame +
                team.seasonInfo.wins * team.getRedraftInfo().goldPerWin +
                team.seasonInfo.ties * team.getRedraftInfo().goldPerTie +
                team.seasonInfo.losses * team.getRedraftInfo().goldPerLoss) /
              1000
            }}k
          </div>
        </div>

        <div
          class="line small"
          v-if="team.getRedraftInfo().cappedBudget != team.getRedraftingCap()"
        >
          <div class="label">Baseline cap</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftingCap() / 1000 }}k</div>
        </div>
        <div
          class="line small"
          v-if="team.getRedraftInfo().cappedBudget != team.getRedraftingCap()"
        >
          <div class="label">Cap limit</div>
          <div class="val" style="grid-column: 2 / 4">
            {{ team.getRedraftInfo().base / 1000 }}k +<br />
            {{ team.getRedraftInfo().redraftRamp / 1000 }}k / game
          </div>
          <div class="sum">
            {{ team.getRedraftInfo().cappedBudget / 1000 }}k
          </div>
        </div>

        <div class="line small">
          <div class="label">Budget cap</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">
            {{ team.getRedraftInfo().cappedBudget / 1000 }}k
          </div>
        </div>

        <div class="line summary">
          <div class="label">Capped budget</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftLimits().budget / 1000 }}k</div>
        </div>
      </div>
    </template>
  </modal>
</template>

<style scoped>
@import "@pages/team/style/redraftingsummary.less";
</style>

<script lang="ts">
import { Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import Team from "../include/Team";
import TeamManagementSettings from "../include/TeamManagementSettings";
import ModalComponent from "./Modal.vue";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class RedraftingSummary extends Vue {
  @Prop({ required: true })
  public team!: Team;

  @Prop({ required: true })
  public fumbblApi!: FumbblApi;

  @Prop({ required: true })
  public settings!: TeamManagementSettings;

  public showRedraftInfo: boolean = false;

  async mounted() {}

  public getRemainingBudget() {
    return (
      this.team.getRedraftLimits().budget -
      this.team.getTotalStaffCost(false) -
      this.team.getTotalPlayerRedraftingCost()
    );
  }

  public getMessage() {
    if (this.getRemainingBudget() < 0) {
      return "Team is too expensive";
    }
    if (this.team.getRosteredPlayers().length < this.settings.startPlayers) {
      return (
        "Must have a minimum of " + this.settings.startPlayers + " players"
      );
    }
    return "";
  }

  public isValid() {
    return this.getMessage().length == 0;
  }
}

export default toNative(RedraftingSummary);
</script>
