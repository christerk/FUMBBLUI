<template>
    <modal :button-settings="{
        cancel: { enabled: true, label: 'Close' },
        confirm: { enabled: false },
    }" :modal-size="'small'" @cancel="cancel" @confirm="confirm" ref="modalInstance">
        <template v-slot:header> {{ confirmModalInfo?.title }} </template>

        <template v-slot:body>
            <p>{{ confirmModalInfo?.text }}</p>
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
class ConfirmModal extends Vue {
    public isVisible: boolean = false;
    public confirmModalInfo: { title: string, text: string, confirm: any } | null = null;

    @Ref
    public modalInstance: InstanceType<typeof ModalComponent> | undefined;

    @Emit("cancelled")
    public cancel() {
        this.hide();
    }

    @Emit("confirmed")
    public confirm() {
        this.hide();
        if (this.confirmModalInfo?.confirm) {
            this.confirmModalInfo.confirm();
        }
    }

    public show(confirmModalInfo: { title: string, text: string; }) {
        this.confirmModalInfo = confirmModalInfo;
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
export default toNative(ConfirmModal);
</script>
