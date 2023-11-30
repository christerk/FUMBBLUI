<template>
  <div class="panelwrapper">
    MATCHES
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    
  </div>
</template>

<style scoped>
@import '@pages/team/style/teammatches.less';
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from 'vue-facing-decorator'
import FumbblApi from "../include/FumbblApi";

@Component
class TeamMatches extends Vue {
  @Prop
  public team;

  @Prop
  public fumbblApi : FumbblApi;

  @Emit
  public close() {

  }

  private statistics: any = {};

  async mounted() {
  }

  public async loadMatches() {

  }

}

export default toNative(TeamMatches);
</script>
