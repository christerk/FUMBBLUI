<template>
  <div class="panelwrapper">
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    <div class="biopanel">
      <div class="biologo"><img :src="'/i/'+team.logo" /></div>
      <div class="biocontent" v-html="team.bio"></div>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/teambio.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";

@Component
class TeamBio extends Vue {
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

  public statistics: any = {};

  async mounted() {
    initializeBBCode();
  }

  public async loadBio() {
  }
}

export default toNative(TeamBio);
</script>
