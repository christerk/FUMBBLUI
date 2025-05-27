<template>
    <transition name="modal-fade">
        <div v-show="isVisible" class="modalbackdrop" @click.prevent="triggerCancel">
            <div class="modal" :class="getModalClasses()" role="dialog" aria-labelledby="modalTitle"
                aria-describedby="modalDescription" @click.stop="">
                <header v-if="excludeHeader !== true" class="modalheader" id="modalTitle">
                    <slot name="header"></slot>
                    <button v-if="excludeCloseTopRight !== true" type="button" class="modalclose" @click="triggerCancel"
                        aria-label="Close modal">
                        &#10006;
                    </button>
                </header>

                <section class="modalbody" id="modalDescription">
                    <slot name="body"></slot>
                </section>

                <section class="modalbuttons" v-if="
                    excludeButtons !== true &&
                    (buttonSettings.cancel.enabled || buttonSettings.confirm.enabled)
                ">
                    <div>
                        <button v-if="buttonSettings.cancel.enabled" class="teambutton" @click="triggerCancel">
                            {{ buttonSettings.cancel.label }}
                        </button>
                        <button v-if="buttonSettings.confirm.enabled" class="teambutton" @click="triggerConfirm">
                            {{ buttonSettings.confirm.label }}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </transition>
</template>

<style scoped>
@import "./modal.less";
</style>

<script lang="ts">
import { PropType } from "vue";
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";

interface ModalButtonSettings {
    cancel: { enabled: boolean; label: string };
    confirm: { enabled: boolean; label: string };
}

@Component
class Modal extends Vue {
    public isVisible: boolean = false;

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
    public triggerCancel(event) {
        event.stopPropagation();
    }

    @Emit("confirm")
    public triggerConfirm() { }

    public show() {
        this.isVisible = true;
    }

    public hide() {
        this.isVisible = false;
    }

    public getModalClasses(): any {
        return {
            modalsmall: this.modalSize === "small",
            modalmedium: this.modalSize === "medium",
            modallarge: this.modalSize === "large",
            modalskill: this.modalSize === "skill",
        };
    }
}

export default toNative(Modal);
</script>
