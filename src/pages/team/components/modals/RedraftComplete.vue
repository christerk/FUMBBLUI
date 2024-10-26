<template>
  <modal
    v-show="isVisible"
    modalSize="'medium'"
    :exclude-header="false"
    :exclude-buttons="true"
    @cancel="hide()"
    @confirm="confirm()"
  >
    <template v-slot:header> Redrafting effects </template>

    <template v-slot:body v-if="result != undefined">
      <template v-for="player in result.players" :key="player.id">
        <div
          class="playerEffects"
          :class="{ condensed: player.actions.length <= 1 }"
        >
          <div class="name">{{ player.number }} {{ player.name }}</div>
          <div class="actions" v-for="item in player.actions" :key="item">
            <div class="type">&bull; {{ item.type }}</div>
            <div class="roll" v-if="item.roll != undefined">
              Roll: {{ item.roll }}
              <span v-if="item.modifier != 0">{{ item.modifier }}</span
              >, target {{ item.target }}
            </div>
            <div class="effect">{{ item.effect }}</div>
          </div>
        </div>
      </template>
    </template>
  </modal>
</template>

<style scoped>
@import "@pages/team/style/redraftcomplete.less";
</style>

<script lang="ts">
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";
import Team from "../../include/Team";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class RedraftCompleteModal extends Vue {
  @Prop({ required: true })
  public team!: Team;

  public isVisible: boolean = false;

  public result: any | undefined = undefined;

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
  }

  public show(result: any) {
    this.result = result;
    this.isVisible = true;
  }

  public hide() {
    this.isVisible = false;
  }
}
export default toNative(RedraftCompleteModal);
</script>
