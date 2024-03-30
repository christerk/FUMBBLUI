<template>
    <modal
      v-show="isVisible"
      :button-settings="{
        cancel: { enabled: true, label: 'Cancel' },
        confirm: { enabled: true, label: 'Set Dedicated Fans' },
      }"
      :modal-size="'small'"
      @cancel="cancel"
      @confirm="confirm"
    >
      <template v-slot:header>Set Dedicated Fans</template>

      <template v-slot:body>
        <p>
          Dedicated Fans: <input ref="input" type="text" v-model="newFans" />
        </p>
      </template>
    </modal>
</template>

<script lang="ts">
import { Ref, Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";
import Team from "../../include/Team";
import TeamManagementSettings from "../../include/TeamManagementSettings";

@Component({
  components: {
    modal: ModalComponent
  }
})
class SetDedicatedFansModal extends Vue {
    public isVisible: boolean = false;
    public newFans: string = "1";

    @Prop({ required: true })
    public teamManagementSettings!: TeamManagementSettings;

    @Prop({ required: true })
    public team!: Team;

    @Ref
    private input: any;

    @Emit
    public cancel() {
        this.hide();
    }

    @Emit
    public confirm() {
        this.hide();
        const fans = parseInt(this.newFans);
        return fans;
    }

    public show() {
      this.newFans = this.team.dedicatedFans.toString();
      this.isVisible = true;

      this.$nextTick(() => {
        this.input.focus();
        this.input.select();
      });
    }

    public hide() {
      this.isVisible = false;
    }

}
export default toNative(SetDedicatedFansModal);

</script>