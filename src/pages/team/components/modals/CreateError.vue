<template>
  <modal
    v-show="isVisible"
    :button-settings="{
      cancel: { enabled: true, label: 'Close' },
      confirm: { enabled: false, label: '' },
    }"
    :modal-size="'small'"
    @confirm="confirm"
    @cancel="cancel"
  >
    <template v-slot:header> Unable to create team. </template>

    <template v-slot:body>
      <p>
        Sorry we are unable to create your team, please review the errors listed
        below.
      </p>
      <ul>
        <li
          v-for="error in teamManagementSettings.getErrorsForCreate(team)"
          :key="error"
        >
          <template v-if="error === 'teamNameBlank'"
            >Team name is blank.</template
          >
          <template v-if="error === 'insufficientTreasury'"
            >Insufficient treasury for chosen players and sideline
            staff.</template
          >
          <template v-if="error === 'insufficientPlayers'"
            >Less than minimum required starting players selected.</template
          >
        </li>
        <li v-for="error in specialRuleErrors" :key="error">
          <template v-if="error === 'oneOfNotChosen'"
            >Special rules: team requires a choice from the "one of"
            options.</template
          >
          <template v-if="error === 'specialRuleNotChosen'"
            >Special rules: team requires a choice from the list of special rule
            options.</template
          >
        </li>
      </ul>
    </template>
  </modal>
</template>

<script lang="ts">
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";
import Team from "../../include/Team";
import TeamManagementSettings from "../../include/TeamManagementSettings";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class ActivateTeamModal extends Vue {
  public isVisible: boolean = false;
  public specialRuleErrors: string[] = [];

  @Prop
  public teamManagementSettings!: TeamManagementSettings;
  @Prop({ required: true })
  public team!: Team;

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
  }

  public show(specialRuleErrors: string[]) {
    this.specialRuleErrors = specialRuleErrors;
    this.isVisible = true;
  }

  public hide() {
    this.isVisible = false;
  }
}
export default toNative(ActivateTeamModal);
</script>
