<template>
    <modal
      v-show="isVisible"
      :button-settings="{
        cancel: { enabled: true, label: 'Cancel' },
        confirm: { enabled: true, label: 'Delete Team' },
      }"
      :modal-size="'small'"
      @cancel="cancel"
      @confirm="confirm"
    >
      <template v-slot:header> Delete team? </template>

      <template v-slot:body>
        <p>Are you sure you want to delete the following team?</p>
        <p>
          Team: <strong>{{ team.getName() }}</strong>
          {{ team.getTeamValue() / 1000 }}k ({{
            teamManagementSettings.rosterName
          }})
        </p>
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
    modal: ModalComponent
  }
})
class DeleteTeamModal extends Vue {
    public isVisible: boolean = false;

    @Prop({ required: true })
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

    public show() {
      this.isVisible = true;
    }

    public hide() {
      this.isVisible = false;
    }

}
export default toNative(DeleteTeamModal);

</script>