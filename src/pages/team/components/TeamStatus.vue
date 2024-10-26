<template>
  <div class="teamstatus" :class="{ showText: showText }">
    <svg
      version="1.1"
      baseProfile="full"
      width="128"
      height="128"
      viewBox="0 0 128 128"
      style="width: 16px; height: 16px"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="forestdark" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#568A33" />
          <stop offset="100%" stop-color="#1A401C" />
        </radialGradient>
        <radialGradient id="forest" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#50a038" />
          <stop offset="100%" stop-color="#4A782C" />
        </radialGradient>
        <radialGradient id="carmine" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#ea5459" />
          <stop offset="100%" stop-color="#c13840" />
        </radialGradient>
        <radialGradient id="neutral" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#999999" />
          <stop offset="100%" stop-color="#5F5F5F" />
        </radialGradient>
        <radialGradient id="jet" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#646464" />
          <stop offset="100%" stop-color="#000000" />
        </radialGradient>
        <radialGradient id="quicksilver" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#FAF9F6" />
          <stop offset="100%" stop-color="#aaaaaa" />
        </radialGradient>
        <radialGradient id="offwhite" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#fbfaf3" />
          <stop offset="100%" stop-color="#bbbab5" />
        </radialGradient>
        <radialGradient id="apricot" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#f8a351" />
          <stop offset="100%" stop-color="#b47828" />
        </radialGradient>
        <radialGradient id="fire" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#fea610" />
          <stop offset="100%" stop-color="#965308" />
        </radialGradient>
        <radialGradient id="blueberry" cx="0.33" cy="0.33" r="0.66">
          <stop offset="0%" stop-color="#8866fa" />
          <stop offset="100%" stop-color="#6240ca" />
        </radialGradient>
      </defs>

      <circle
        class="bg"
        cx="64"
        cy="64"
        r="64"
        :fill="'url(#' + team.getTeamStatus().style + ')'"
      />
      <circle
        class="outline"
        cx="64"
        cy="64"
        r="63"
        fill="none"
        stroke="Black"
        stroke-width="2"
      />
      <text
        class="letter"
        text-rendering="geometricPrecision"
        x="63"
        y="96"
        font-family="Arial"
        font-size="89"
        text-anchor="middle"
        :fill="team.getTeamStatus().textColour"
      >
        {{ team.getTeamStatus().letter }}
      </text>
    </svg>
    <div v-if="showText" class="name">
      {{ team.getTeamStatus().displayName }}
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/teamstatus.less";
</style>

<script lang="ts">
import { Prop, Component, Vue, toNative } from "vue-facing-decorator";
import Team from "../include/Team";

@Component({})
class TeamStatus extends Vue {
  @Prop({ required: true })
  public team!: Team;

  @Prop({ required: true })
  public showText!: boolean;

  public letter: string = "";
  public style: string = "";
  public textColor: string = "";
  public title: string = "";

  mounted() {
    this.letter = "X";
    this.style = "Y";
    this.textColor = "abc";
    this.title = "";
  }
}

export default toNative(TeamStatus);
</script>
