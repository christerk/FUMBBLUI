<template>
  <modal
    :button-settings="{
      cancel: { enabled: true, label: 'Close' },
      confirm: { enabled: false },
    }"
    :modal-size="'small'"
    @cancel="cancel"
    @confirm="confirm"
    ref="modalInstance"
  >
    <template v-slot:header> Error </template>

    <template v-slot:body>
      <p>{{ errorModalInfo?.general }}</p>
      <p v-if="(errorModalInfo?.technical ?? '').length > 0">
        Technical details: {{ errorModalInfo?.technical }}
      </p>
    </template>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, toNative, Emit, Ref } from "vue-facing-decorator";
import ModalComponent from "../modal/modal.vue";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class ErrorModal extends Vue {
  public isVisible: boolean = false;
  public errorModalInfo: { general: string; technical: string } | null = null;

  @Ref
  public modalInstance: InstanceType<typeof ModalComponent> | undefined;

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
  }

  public show(errorModalInfo: { general: string; technical: string }) {
    this.errorModalInfo = errorModalInfo;
    if (this.modalInstance != undefined) {
      this.modalInstance.isVisible = true;
    }
  }

  public hide() {
    if (this.modalInstance != undefined) {
      this.modalInstance.isVisible = false;
    }
  }
}
export default toNative(ErrorModal);
</script>
