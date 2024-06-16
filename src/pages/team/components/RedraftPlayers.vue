<template>
  <div class="hirerookies">
    <div class="hirerookie" v-for="player in players" :key="player.getId()">
      <div class="rookieheader">
        <div class="positionname" :title="player.getPlayerName()">
          {{ player.getPlayerName() }}
          ({{ player.sppDisplayInfo().spendable }} SPP)
        </div>
        <div class="positionquantity">
          {{
            rosterPositionDataForBuyingPlayer.find(
              (p) => p.positionId == player.getPositionId(),
            )?.quantityHired
          }}
          /
          {{
            rosterPositionDataForBuyingPlayer.find(
              (p) => p.positionId == player.getPositionId(),
            )?.position.quantityAllowed
          }}
        </div>
        <div class="positioncost">{{ player.getRedraftingCost() / 1000 }}k</div>
      </div>
      <div class="rookiebody">
        <div class="position">{{ player.getPosition()?.name }}</div>
        <div class="iconwithstats">
          <div class="positioniconcontainer">
            <div
              class="iconusingbackground"
              :style="
                rosterIconManager.getIconStyle(
                  player.getPositionId(),
                  player.getIconRowVersionPosition(),
                )
              "
            ></div>
          </div>
          <table class="rookiestats">
            <tr>
              <th>MA</th>
              <th>ST</th>
              <th>AG</th>
              <th>PA</th>
              <th>AV</th>
            </tr>
            <tr>
              <td>{{ player.movementStat }}</td>
              <td>{{ player.strengthStat }}</td>
              <td>{{ player.agilityStat }}+</td>
              <td>
                {{ player.passingStat ? `${player.passingStat}+` : "-" }}
              </td>
              <td>{{ player.armourStat }}+</td>
            </tr>
          </table>
          <div class="buying">
            <button
              class="teambutton"
              :class="{
                disabled: !canBuyPosition(getPositionData(player)),
              }"
              @click="rehirePlayer(player)"
              title=""
            >
              Rehire
            </button>
          </div>
        </div>
        <div class="skillrow">
          <div class="injuries" v-if="player.getInjuries().length > 0">
            <span class="label">Injuries: </span
            >{{ player.getInjuries().join(", ") }}
          </div>
          <div class="skills">
            <div class="positionskills">
              {{ player.getPositionSkills().join(", ") }}
            </div>
            <div class="playerskills">
              {{ player.getSkills().join(", ") }}
            </div>
          </div>
        </div>
        <div class="quantityprogressouter"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@pages/team/style/redraftplayers.less";
</style>

<script lang="ts">
import { PropType } from "vue";
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import Team from "../include/Team";
import Player from "../include/Player";
import TeamManagementSettings from "../include/TeamManagementSettings";
import RosterIconManager from "../include/RosterIconManager";
import { PositionDataForBuyingPlayer } from "../include/Interfaces";

@Component
class RedraftPlayers extends Vue {
  @Prop({
    type: Array as PropType<PositionDataForBuyingPlayer[]>,
    required: true,
  })
  public rosterPositionDataForBuyingPlayer!: PositionDataForBuyingPlayer[];

  @Prop({
    type: Object as PropType<RosterIconManager>,
    required: true,
  })
  public rosterIconManager!: RosterIconManager;

  @Prop({
    type: Boolean,
    required: true,
  })
  public hasEmptyTeamSheetEntry!: boolean;

  @Prop({
    type: Number,
    required: true,
  })
  public maxBigGuys!: number;

  @Emit("rehire-player")
  public triggerRehirePlayer(player: Player) {
    return player;
  }

  public players: Player[] = [];

  public add(player: Player) {
    this.players.push(player);
  }

  public remove(player: Player) {
    const index = this.players.findIndex((p) => player.getId() == p.getId());
    this.players.splice(index, 1);
  }

  public reset(team: Team) {
    while (this.players.length > 0) {
      this.players.pop();
    }
    team.firedPlayers.forEach((player) => {
      this.add(player);
    });
  }

  async mounted() {}

  public getPositionData(
    player: Player,
  ): PositionDataForBuyingPlayer | undefined {
    return this.rosterPositionDataForBuyingPlayer.find(
      (p) => p.positionId == player.getPositionId(),
    );
  }

  private get bigGuyCount(): number {
    let bigGuyCount = 0;
    for (const positionDataForBuyingPlayer of this
      .rosterPositionDataForBuyingPlayer) {
      if (positionDataForBuyingPlayer.position.isBigGuy) {
        bigGuyCount += positionDataForBuyingPlayer.quantityHired;
      }
    }
    return bigGuyCount;
  }

  public reasonsCannotBuy(
    positionDataForBuyingPlayer: PositionDataForBuyingPlayer,
  ): string[] {
    const errors: string[] = [];
    if (!this.hasEmptyTeamSheetEntry) {
      errors.push("No space left on team list.");
    }
    if (
      positionDataForBuyingPlayer.quantityHired >=
      positionDataForBuyingPlayer.position.quantityAllowed
    ) {
      errors.push("Limit for position reached.");
    }
    if (!positionDataForBuyingPlayer.canAfford) {
      errors.push("Insufficient treasury.");
    }
    if (
      positionDataForBuyingPlayer.position.isBigGuy &&
      this.bigGuyCount >= this.maxBigGuys
    ) {
      errors.push("Maximum Big Guy limit reached.");
    }
    return errors;
  }

  public canBuyPosition(
    positionDataForBuyingPlayer: PositionDataForBuyingPlayer | undefined,
  ): boolean {
    return (
      positionDataForBuyingPlayer != undefined &&
      this.reasonsCannotBuy(positionDataForBuyingPlayer).length === 0
    );
  }

  public rehirePlayer(player: Player) {
    let positionData = this.getPositionData(player);
    if (this.canBuyPosition(positionData)) {
      this.triggerRehirePlayer(player);
    }
  }
}

export default toNative(RedraftPlayers);
</script>
