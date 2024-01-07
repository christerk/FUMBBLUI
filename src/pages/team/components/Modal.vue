<template>
  <transition name="modal-fade">
    <div class="modalbackdrop">
      <div
        class="modal"
        :class="getModalClasses()"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <header
          v-if="excludeHeader !== true"
          class="modalheader"
          id="modalTitle"
        >
          <slot name="header"></slot>
          <button
            v-if="excludeCloseTopRight !== true"
            type="button"
            class="modalclose"
            @click="triggerCancel"
            aria-label="Close modal"
          >
            x
          </button>
        </header>

        <section class="modalbody" id="modalDescription">
          <slot name="body"></slot>
        </section>

        <section
          class="modalbuttons"
          v-if="
            excludeButtons !== true &&
            (buttonSettings.cancel.enabled || buttonSettings.confirm.enabled)
          "
        >
          <div>
            <button
              v-if="buttonSettings.cancel.enabled"
              class="teambutton"
              @click="triggerCancel"
            >
              {{ buttonSettings.cancel.label }}
            </button>
            <button
              v-if="buttonSettings.confirm.enabled"
              class="teambutton"
              @click="triggerConfirm"
            >
              {{ buttonSettings.confirm.label }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { PropType } from "vue";
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import { ModalButtonSettings } from "../include/Interfaces";

@Component
class ModalComponent extends Vue {
  @Prop({
    type: Object as PropType<ModalButtonSettings>,
    required: false,
    default: {
      cancel: { enabled: true, label: "Cancel" },
      confirm: { enabled: true, label: "Ok" },
    },
  })
  public buttonSettings!: ModalButtonSettings;

  @Prop({
    type: String,
    required: false,
    default: "medium",
  })
  public modalSize?: string = "medium";

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  public excludeCloseTopRight: boolean = false;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  public excludeHeader: boolean = false;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  public excludeButtons: boolean = false;

  @Emit("cancel")
  public triggerCancel() {}

  @Emit("confirm")
  public triggerConfirm() {}

  public getModalClasses(): any {
    return {
      modalsmall: this.modalSize === "small",
      modalmedium: this.modalSize === "medium",
      modallarge: this.modalSize === "large",
      modalskill: this.modalSize === "skill",
    };
  }
}

export default toNative(ModalComponent);
</script>

<style>
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}
</style>
