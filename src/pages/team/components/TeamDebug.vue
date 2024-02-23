<template>
  <div class="panelwrapper">
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    <div class="debugpanel">
      <div class="title">Debug</div>
      <div class="debugcontent">
        <button @click="roll" >Roll Dice</button>
        <die
          type="d6"
          ref="debugDie"
          @complete="completeExpensiveMistakes"
        ></die>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/teamdebug.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative, Ref } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import { Die } from "@components/fumbblcomponents";

@Component({
  components: {
    Die
  }
})
class TeamDebug extends Vue {

  @Prop
  public team;

  @Prop
  public fumbblApi: FumbblApi;

  @Emit
  public close() {}

  @Emit("unexpected-error")
  public triggerUnexpectedError(errorMessage: string): string {
    return errorMessage;
  }

  @Ref
  private debugDie: Die;

  async mounted() {}

  private roll() {
    this.debugDie.roll(Math.floor(Math.random() * 6)+1);
  }
}

export default toNative(TeamDebug);
</script>
