<template>
  <modal
    v-show="isVisible"
    :exclude-header="false"
    :exclude-buttons="false"
    @cancel="cancel()"
    @confirm="confirm"
  >
    <template v-slot:header> Edit Bio </template>

    <template v-slot:body>
      <textarea id="bio-editor" v-model="bioText"> </textarea>
    </template>
  </modal>
</template>

<style scoped>
@import "@pages/team/style/editbio.less";
</style>

<script lang="ts">
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";
import Team from "../../include/Team";
import FumbblApi from "../../include/FumbblApi";
import { PropType } from "vue";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class EditBioModal extends Vue {
  public isVisible: boolean = false;
  public bioText: string = "";

  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({ required: true })
  public team!: Team;

  public mounted() {}

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirm")
  public confirm(): string {
    this.hide();
    return this.bioText;
  }

  public show() {
    this.$nextTick(async () => {
      await this.load();
    });
    this.isVisible = true;
  }

  public hide() {
    this.isVisible = false;
  }

  public async load() {
    const bioCode = await this.fumbblApi.getBioCode(this.team.id);
    this.bioText = bioCode?.data ?? "";
  }
}
export default toNative(EditBioModal);
</script>
