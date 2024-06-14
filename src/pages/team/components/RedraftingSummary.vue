<template>
  <div class="wrapper">
    <div class="section">
      <div class="title">Re-drafting budget</div>
      <div class="value">{{ team.getRedraftCappedBudget() / 1000 }}k</div>
    </div>
    <div class="section op">-</div>
    <div class="section">
      <div class="title">Player (re-)hiring cost</div>
      <div class="value">{{ team.getTotalPlayerCost() / 1000 }}k</div>
    </div>
    <div class="section op">-</div>
    <div class="section">
      <div class="title">Team staff cost</div>
      <div class="value">{{ team.getTotalStaffCost() / 1000 }}k</div>
    </div>
    <div class="section op">=</div>
    <div class="section">
      <div class="title">Remaining Budget</div>
      <div class="value">{{ getRemainingBudget() / 1000 }}k</div>
    </div>
    <div class="message">{{ getMessage() }}</div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/redraftingsummary.less";
</style>

<script lang="ts">
import { Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import Team from "../include/Team";
import TeamManagementSettings from "../include/TeamManagementSettings";

@Component
class RedraftingSummary extends Vue {
  @Prop({ required: true })
  public team!: Team;

  @Prop({ required: true })
  public fumbblApi!: FumbblApi;

  @Prop({ required: true })
  public settings!: TeamManagementSettings;

  async mounted() {}

  getRemainingBudget() {
    return (
      this.team.getRedraftCappedBudget() -
      this.team.getTotalStaffCost() -
      this.team.getTotalPlayerCost()
    );
  }

  getMessage() {
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

  isValid() {
    return this.getMessage().length == 0;
  }
}

export default toNative(RedraftingSummary);
</script>
