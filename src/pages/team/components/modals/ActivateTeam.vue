<template>
    <modal
      v-show="isVisible"
      :button-settings="{
        cancel: { enabled: true, label: 'Oops, let me go back and check!' },
        confirm: { enabled: true, label: 'Yes, my team complies' },
      }"
      :modal-size="'medium'"
      @cancel="cancel"
      @confirm="confirm"
    >
    <template v-slot:header> * * * Important Notice * * * </template>

    <template v-slot:body>
        <p>
          Before you activate your team, please make sure your team complies
          with our
          <a
            href="https://fumbbl.com/note/Christer/NamesAndImages"
            target="_blank"
            >Team Naming Policy</a
          >.
        </p>
        <p>
          Failure to follow these rules may result in your account being
          suspended for some time, depending on the severity of the
          transgression. The staff and the community are constantly monitoring
          teams and we do take this seriously. So, please make sure your team is
          in accordance with the rules before activating it.
        </p>
      </template>
    </modal>    
</template>

<script lang="ts">
import { Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";

@Component({
  components: {
    modal: ModalComponent
  }
})
class ActivateTeamModal extends Vue {
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
export default toNative(ActivateTeamModal);

</script>