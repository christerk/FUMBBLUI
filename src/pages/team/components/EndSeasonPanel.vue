<template>
  <div v-if="team.isAtSeasonEnd()" class="endseasonpanel">
    <div class="title">The season has ended for this team</div>
    <div class="description">
      <p>
        This team has completed the games for this season. You can either take
        the team into play-offs (tournaments), or skip the tournaments and move
        on to the next season.
      </p>
      <p>
        If you wish to go into play-offs apply for appropriate tournament,
        otherwise click the button below.
      </p>
      <div class="center">
        <button @click.prevent="redraft" v-if="allowRedraft">
          Skip tournaments and re-draft
        </button>
        <button @click.prevent="skipTournaments" v-else>
          Skip tournaments
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/endseasonpanel.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import Team from "../include/Team";
import ModalComponent from "./Modal.vue";
import RedraftBudget from "./modals/RedraftBudget.vue";
import TeamManagementSettings from "../include/TeamManagementSettings";

@Component({
  components: {
    modal: ModalComponent,
    redraftbudget: RedraftBudget,
  },
})
class EndSeasonPanel extends Vue {
  @Prop({ required: true })
  public team!: Team;

  @Prop({ required: true })
  public settings!: TeamManagementSettings;

  @Prop({ required: true })
  public allowRedraft!: boolean;

  @Emit
  public redraft() {}

  @Emit
  public skipTournaments() {}

  async mounted() {}
}

export default toNative(EndSeasonPanel);
</script>
