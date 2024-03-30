<template>
    <modal
      v-show="isVisible"
      :button-settings="{
        cancel: { enabled: true, label: 'Cancel' },
        confirm: { enabled: true, label: 'Set Treasury' },
      }"
      :modal-size="'small'"
      @cancel="cancel"
      @confirm="confirm"
    >
      <template v-slot:header>Set Treasury</template>

      <template v-slot:body>
        <p>
          Treasury: <input ref="input" type="text" v-model="newTreasury" />
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
class SetTreasuryModal extends Vue {
    public isVisible: boolean = false;
    public newTreasury: string = "0";

    @Ref
    private input: any;

    @Prop({ required: true })
    public teamManagementSettings!: TeamManagementSettings;

    @Prop({ required: true })
    public team!: Team;

    @Emit
    public cancel() {
        this.hide();
    }

    @Emit
    public confirm(): number {
        this.hide();
        const treasury = parseInt(this.newTreasury);
        return treasury;
    }

    async mounted() {
    }

    public show() {
      this.newTreasury = this.team.treasury.toString();
      this.isVisible = true;

      this.$nextTick(() => {
        this.input.focus();
        const treasury = parseInt(this.newTreasury);
        if (treasury >= 1000) {
          let end = Math.floor(Math.log10(treasury)-2);
          this.input.setSelectionRange(0, end);
        } else {
          this.input.select();
        }
      });
    }

    public hide() {
      this.isVisible = false;
    }

}
export default toNative(SetTreasuryModal);

</script>