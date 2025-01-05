<template>
  <modal
    :button-settings="{
      cancel: { enabled: true, label: 'Close' },
      confirm: { enabled: true, label: 'Rename' },
    }"
    :modal-size="'small'"
    @cancel="cancel"
    @confirm="confirm"
    ref="modalInstance"
  >
    <template v-slot:header> Rename Squad </template>

    <template v-slot:body>
      <input
        id="squadNameInput"
        style="width: 100%; margin: 0.5rem 0"
        :placeholder="currentName"
        type="text"
        v-model="newName"
      />
    </template>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, toNative, Emit, Ref } from "vue-facing-decorator";
import { Modal } from "../../../components/fumbblcomponents";

@Component({
  components: {
    modal: Modal,
  },
})
class RenameSquadModal extends Vue {
  public newName: string = "";
  public currentName: string = "";

  @Ref
  public modalInstance: InstanceType<typeof Modal> | undefined;

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
    return this.newName;
  }

  public show(currentName: string) {
    this.newName = "";
    if (this.modalInstance != undefined) {
      this.modalInstance.isVisible = true;
    }
    this.currentName = currentName;

    this.$nextTick(() => {
      document.getElementById("squadNameInput")?.focus();
    });
  }

  public hide() {
    if (this.modalInstance != undefined) {
      this.modalInstance.isVisible = false;
    }
  }
}
export default toNative(RenameSquadModal);
</script>
