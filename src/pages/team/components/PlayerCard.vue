<template>
  <div class="wrap">
    <div
      :class="{
        header: true,
        narrow: narrow,
      }"
      v-if="player != null"
    >
      <div class="portrait"><img v-bind:src="getPortrait()" /></div>
      <div class="name">{{ player.getPlayerName() }}</div>
      <div class="position">{{ player.getPositionName() }}</div>
      <div :class="{ stats: true, hasPass: player.passingStat != null }">
        <div class="stat">
          <div class="title">MA</div>
          <div class="val">{{ player.movementStat }}</div>
        </div>
        <div class="stat">
          <div class="title">ST</div>
          <div class="val">{{ player.strengthStat }}</div>
        </div>
        <div class="stat">
          <div class="title">AG</div>
          <div class="val">{{ getStatString(player.agilityStat) }}</div>
        </div>
        <div class="stat" v-if="player.passingStat != null">
          <div class="title">PA</div>
          <div class="val">{{ getStatString(player.passingStat) }}</div>
        </div>
        <div class="stat">
          <div class="title">AV</div>
          <div class="val">{{ getStatString(player.armourStat) }}</div>
        </div>

        <div class="stat">
          <div class="title">GS</div>
          <div class="val">{{ player.getRecord().spp.total }}</div>
        </div>
        <div class="stat">
          <div class="title">XPP</div>
          <div class="val">{{ player.getRecord().spp.extra }}</div>
        </div>
        <div class="stat">
          <div class="title">SS</div>
          <div class="val">{{ player.getRecord().spp.spent }}</div>
        </div>
        <div class="stat">
          <div class="title">SPP</div>
          <div class="val">
            {{
              player.getRecord().spp.total +
              player.getRecord().spp.extra -
              player.getRecord().spp.spent
            }}
          </div>
        </div>
      </div>
      <div class="skills">
        <div class="title">Skills</div>
        <div class="positionSkills" :key="serial">
          {{ player.getPositionSkills().join(", ") }}
        </div>
        <div class="playerSkills" :key="serial">
          {{ player.getSkills().join(", ") }}
        </div>
      </div>
      <div class="injuries">
        <div class="title">Injuries</div>
        <div class="positionSkills">
          {{ getInjuries().join(", ") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../style/playercard.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Prop } from "vue-facing-decorator";
import Player from "../include/Player";

@Component({})
class PlayerCard extends Vue {
  public player: Player | null = null;

  public serial: number = 1;

  @Prop({
    required: false,
  })
  public narrow: boolean = false;

  public setPlayer(player: Player) {
    this.player = player;
    this.serial++;
  }

  public async rollsComplete() {}

  public getPortrait(): string {
    return "https://fumbbl.com/i/" + (this.player?.getPortrait() ?? "");
  }

  public getStatString(val: number) {
    return val > 0 ? val + "+" : "-";
  }

  public getInjuries(): string[] {
    let injuries = [];

    if (this.player != null) {
      for (const inj of this.player.getInjuries()) {
        injuries.push(inj);
      }
    }

    if (this.player?.IsTemporarilyRetired) {
      injuries.push("Temporarily Retired");
    }

    return injuries;
  }
}

export default toNative(PlayerCard);
</script>
