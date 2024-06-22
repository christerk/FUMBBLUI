<template>
  <div class="panelwrapper">
    <button @click="close" class="backbutton">&lt;&lt; Back</button>
    <div class="logpanel">
      <div class="title">Log</div>
      <div class="logcontent" :class="{ staff: isStaff }">
        <template v-for="entry in log" :key="entry">
          <div class="date">{{ entry.date }}</div>
          <div class="coach">{{ entry.coach }}</div>
          <div v-if="isStaff" class="ip">{{ entry.ip }}</div>
          <div class="entry">{{ entry.entry }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/teamlog.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import Team from "../include/Team";
import FumbblApi from "../include/FumbblApi";

@Component({})
class TeamLog extends Vue {
  @Prop({ required: true })
  public team!: Team;

  @Prop({ required: true })
  public fumbblApi!: FumbblApi;

  @Prop({ required: true })
  public isStaff!: boolean;

  @Emit
  public close() {}

  @Emit("unexpected-error")
  public triggerUnexpectedError(errorMessage: string): string {
    return errorMessage;
  }

  public log: { date: string; coach: string; ip: string; entry: string }[] = [];

  mounted() {}

  public async loadLog() {
    let response = await this.fumbblApi.getLog(this.team.id);
    this.log = response.data;
  }
}

export default toNative(TeamLog);
</script>
