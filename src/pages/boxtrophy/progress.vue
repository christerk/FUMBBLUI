<template>
  <div v-if="season != null" class="progress">
    <div class="progressbg" :style="{ width: progressWidth + '%' }"></div>
    <div class="timeline">
      <div>{{ startDate }}</div>
      <div style="font-weight: bold">{{ remaining }}</div>
      <div>{{ endDate }}</div>
    </div>
  </div>
</template>

<style scoped>
@import "./progress.less";
</style>

<script lang="ts">
import { Component, Vue, Prop, toNative } from "vue-facing-decorator";

@Component
class Progress extends Vue {
  @Prop
  public season: any;

  public get startDate() {
    if (this.season == null) {
      return "";
    }
    return this.season.start;
  }

  public get endDate() {
    if (this.season == null) {
      return "";
    }
    return this.season.end;
  }

  public get started() {
    const currentDate = new Date();
    let daysToStart = Math.floor(this.daysBetween(currentDate, this.startDate));

    return daysToStart <= 0;
  }

  public get ended() {
    const currentDate = new Date();
    let days = Math.ceil(this.daysBetween(currentDate, this.endDate));

    return days < 0;
  }

  public get progressWidth() {
    if (this.season == null) {
      return 0;
    }
    const currentDate = new Date();

    let daysToStart = Math.floor(this.daysBetween(currentDate, this.startDate));

    let days = Math.ceil(this.daysBetween(currentDate, this.endDate));

    let seasonLength =
      Math.ceil(this.daysBetween(this.startDate, this.endDate)) + 1;

    if (daysToStart > 0) {
      days = seasonLength;
    }

    return Math.min(
      100,
      Math.floor((100 * (seasonLength - days)) / seasonLength),
    );
  }

  public get remaining() {
    if (this.season == null) {
      return "";
    }
    const currentDate = new Date();

    let remaining: string = "";

    let daysToStart = Math.floor(this.daysBetween(currentDate, this.startDate));
    let days = Math.ceil(this.daysBetween(currentDate, this.endDate));

    if (daysToStart > 0) {
      remaining =
        "Starting in " + daysToStart + " day" + (daysToStart > 1 ? "s" : "");
    } else if (days >= 0) {
      remaining = days + " day" + (days !== 1 ? "s" : "") + " remaining";
    } else if (!this.endDate) {
      remaining = "Not started";
    } else {
      remaining = "Ended";
    }
    return remaining;
  }

  public mounted() {}

  private daysBetween(startDate: any, endDate: any) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (
      (this.treatAsUTC(endDate) - this.treatAsUTC(startDate)) /
      millisecondsPerDay
    );
  }

  private treatAsUTC(date: any): any {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  }
}

export default toNative(Progress);
</script>
