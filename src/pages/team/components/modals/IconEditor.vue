<template>
  <modal
    v-show="isVisible"
    :exclude-header="false"
    :exclude-buttons="true"
    @cancel="hide()"
    @confirm="confirm()"
  >
    <template v-slot:header> Icon editor </template>

    <template v-slot:body>
      <div class="icon">
        <svg
          width="300"
          height="300"
          viewBox="0 0 64 64"
          image-rendering="pixelated"
        >
          <template v-for="slot in frontSkeleton.slots" :key="slot.id">
            <template
              v-for="diagramIndex in [diagrams[slot.name] ?? 0]"
              :key="diagramIndex"
            >
              <template v-if="slot.diagrams.length > 0">
                <image
                  :x="
                    slot.x +
                    32 +
                    slot.diagrams[diagramIndex].x -
                    slot.diagrams[diagramIndex].width / 2
                  "
                  :y="
                    64 -
                    slot.y -
                    slot.diagrams[diagramIndex].y -
                    slot.diagrams[diagramIndex].height / 2
                  "
                  :href="
                    'https://fumbbl.com/i/' + slot.diagrams[diagramIndex].image
                  "
                />
              </template>
            </template>
          </template>
        </svg>
      </div>
      <div class="icon">
        <svg
          width="300"
          height="300"
          viewBox="0 0 64 64"
          image-rendering="pixelated"
        >
          <template v-for="slot in sideSkeleton.slots" :key="slot.id">
            <template
              v-for="diagramIndex in [diagrams[slot.name] ?? 0]"
              :key="diagramIndex"
            >
              <template v-if="slot.diagrams.length > 0">
                <image
                  :x="
                    slot.x +
                    32 +
                    slot.diagrams[diagramIndex].x -
                    slot.diagrams[diagramIndex].width / 2
                  "
                  :y="
                    64 -
                    slot.y -
                    slot.diagrams[diagramIndex].y -
                    slot.diagrams[diagramIndex].height / 2
                  "
                  :href="
                    'https://fumbbl.com/i/' + slot.diagrams[diagramIndex].image
                  "
                />
              </template>
            </template>
          </template>
        </svg>
      </div>

      <template v-for="slot in frontSkeleton.slots" :key="slot.id">
        <div>
          {{ slot.name }}
          <select v-model="diagrams[slot.name]">
            <template
              v-for="(diagram, index) in slot.diagrams"
              :key="diagram.id"
            >
              <option :value="index">{{ diagram.name }}</option>
            </template>
          </select>
        </div>
      </template>
    </template>
  </modal>
</template>

<style scoped>
@import "@pages/team/style/iconeditor.less";
</style>

<script lang="ts">
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";
import Player from "../../include/Player";
import FumbblApi from "../../include/FumbblApi";
import { PropType } from "vue";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class IconEditor extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({ required: true })
  public player!: Player;

  public diagrams: any = {};

  public isVisible: boolean = false;

  public result: any | undefined = undefined;

  public skeletons: any = "";
  public frontSkeleton: any = "";
  public sideSkeleton: any = "";

  public mounted() {}

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
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
    const positionId = this.player.getPositionId();

    if (!positionId) {
      return;
    }
    const iconData = (
      await this.fumbblApi?.getIconData(this.player.getPositionId())
    )?.data;

    iconData.skeletons.forEach(async (skeleton: any) => {
      if (skeleton.perspective == "Front") {
        this.frontSkeleton = skeleton;
      }
      if (skeleton.perspective == "Side") {
        this.sideSkeleton = skeleton;
      }
    });

    this.frontSkeleton.slots.forEach((d) => {
      this.diagrams[d.name] = 0;
    });
  }
}
export default toNative(IconEditor);
</script>
