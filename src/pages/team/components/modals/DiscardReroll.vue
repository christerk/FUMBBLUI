<template>
  <modal
    v-show="isVisible"
    :button-settings="{
      cancel: { enabled: true, label: 'Cancel' },
      confirm: { enabled: true, label: 'Discard' },
    }"
    :modal-size="'small'"
    @cancel="cancel"
    @confirm="confirm"
  >
    <template v-slot:header>Discard reroll</template>

    <template v-slot:body>
      <p>
        Are you sure you wish to discard this reroll? This cannot be undone.
      </p>
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
class DiscardRerollModal extends Vue {
  public isVisible: boolean = false;

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
export default toNative(DiscardRerollModal);
</script>
