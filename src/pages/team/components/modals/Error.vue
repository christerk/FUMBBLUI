<template>
  <modal
    v-show="isVisible && errorModalInfo != null"
    :button-settings="{
      cancel: { enabled: true, label: 'Close' },
      confirm: { enabled: false },
    }"
    :modal-size="'small'"
    @cancel="cancel"
    @confirm="confirm"
  >
    <template v-slot:header> Error </template>

    <template v-slot:body>
      <p>{{ errorModalInfo?.general }}</p>
      <p>Technical details: {{ errorModalInfo?.technical }}</p>
    </template>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class ErrorModal extends Vue {
  public isVisible: boolean = false;
  public errorModalInfo: { general: string; technical: string } | null = null;

  @Emit("cancelled")
  public cancel() {
    this.hide();
    this.errorModalInfo = null;
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
    this.errorModalInfo = null;
  }

  public show(errorModalInfo: { general: string; technical: string }) {
    console.log("ErrorModal called", errorModalInfo);
    this.errorModalInfo = errorModalInfo;
    this.isVisible = true;
  }

  public hide() {
    this.isVisible = false;
  }
}
export default toNative(ErrorModal);
</script>
