<template>
  <div class="wrapper">
    <div class="section">
      <div class="title">Re-drafting budget</div>
      <div class="value">
        {{ team.getRedraftLimits().budget / 1000 }}k
        <div class="infolink" @click.prevent="budgetModal?.show()">?</div>
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

  <redraftbudget :team="team" ref="budgetModal"> </redraftbudget>
</template>

<style scoped>
@import "@pages/team/style/redraftingsummary.less";
</style>

<script lang="ts">
import { Ref, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import Team from "../include/Team";
import TeamManagementSettings from "../include/TeamManagementSettings";
import ModalComponent from "./Modal.vue";
import RedraftBudget from "./modals/RedraftBudget.vue";

@Component({
  components: {
    modal: ModalComponent,
    redraftbudget: RedraftBudget,
  },
})
class RedraftingSummary extends Vue {
  @Prop({ required: true })
  public team!: Team;

  @Prop({ required: true })
  public fumbblApi!: FumbblApi;

  @Prop({ required: true })
  public settings!: TeamManagementSettings;

  @Ref
  public budgetModal: InstanceType<typeof RedraftBudget> | undefined;

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
    if (this.getRemainingBudget() != this.team.treasury) {
      return "Treasury and Remaining budget do not match. Typically, this is due to a bug.";
    }
    return "";
  }

  public isValid() {
    return this.getMessage().length == 0;
  }
}

export default toNative(RedraftingSummary);
</script>
