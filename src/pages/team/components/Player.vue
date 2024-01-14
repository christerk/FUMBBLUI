<template>
  <div
    :class="{
      playerrow: true,
      playerinrow: player != undefined,
      empty: player.IsEmpty,
      canhirerookie: accessControl.canHireRookie(),
    }"
    :key="key"
  >
    <div
      class="main"
      :class="{
        missnextgame: player != undefined && player.isMissNextGame(),
        compact: compactView,
      }"
      v-on="
        accessControl.canHireRookie() && player.IsEmpty
          ? { click: triggerShowHireRookies }
          : {}
      "
    >
      <div
        v-if="
          accessControl.canRenumberPlayers() &&
          !player.getIsJourneyman() &&
          !player.isTemporaryPlayer
        "
        class="cell draghandle handle"
      >
        <svg
          fill="#000000"
          version="1.1"
          id="icon"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="15px"
          height="25px"
          viewBox="0 0 32 32"
          xml:space="preserve"
        >
          <title>draggable</title>
          <rect x="10" y="6" width="4" height="4" />
          <rect x="18" y="6" width="4" height="4" />
          <rect x="10" y="14" width="4" height="4" />
          <rect x="18" y="14" width="4" height="4" />
          <rect x="10" y="22" width="4" height="4" />
          <rect x="18" y="22" width="4" height="4" />
          <rect
            id="_Transparent_Rectangle_"
            width="15"
            height="25"
            style="fill: none"
          />
        </svg>
      </div>
      <div v-else class="cell draghandledisabled"></div>
      <div class="cell playernumber">
        <span class="normalplayernumber">
          {{ player.playerNumber }}
        </span>
      </div>
      <div class="cell playericoncontainer">
        <div
          v-if="!player.IsEmpty"
          class="iconusingbackground"
          :style="
            rosterIconManager.getIconStyle(
              player.getPositionId(),
              player.getIconRowVersionPosition(),
            )
          "
        ></div>
      </div>
      <div class="cell playerdetails">
        <div class="playername" :title="player.getPlayerName()">
          <span v-if="player.isTemporaryPlayerWithoutName()">Loading...</span>
          <span
            v-else-if="
              player.isTemporaryPlayer ||
              player.getIsJourneyman() ||
              player.IsEmpty
            "
            >{{ player.getPlayerName() }}</span
          >
          <a
            v-else
            href="#"
            @click.exact.prevent="toggleFoldOutMore(false)"
            @click.ctrl.prevent="toggleFoldOutMore(true)"
            :title="`Player: ${player.getPlayerName()}, ID: ${player.id}`"
            >{{ player.getPlayerName() }}</a
          >
        </div>
        <div
          v-if="!player.IsEmpty"
          class="playerposition"
          :title="player.getDisplayPositionName()"
        >
          {{ player.getDisplayPositionName() }}
        </div>
      </div>
      <template v-if="!compactView && !player.IsEmpty">
        <div class="cell statma">
          <span
            :class="{
              statincrease: player.hasMovementIncrease,
              statdecrease: player.hasMovementDecrease,
            }"
            >{{ player.movementStat }}</span
          >
        </div>
        <div class="cell statst">
          <span
            :class="{
              statincrease: player.hasStrengthIncrease,
              statdecrease: player.hasStrengthDecrease,
            }"
            >{{ player.strengthStat }}</span
          >
        </div>
        <div class="cell statag">
          <span
            :class="{
              statincrease: player.hasAgilityIncrease,
              statdecrease: player.hasAgilityDecrease,
            }"
            >{{ player.agilityStat }}+</span
          >
        </div>
        <div class="cell statpa">
          <span
            v-if="player.getPositionStats().Passing"
            :class="{
              statincrease: player.hasPassingIncrease,
              statdecrease: player.hasPassingDecrease,
            }"
            >{{ player.passingStat }}+</span
          >
          <span v-else>-</span>
        </div>
        <div class="cell statav">
          <span
            :class="{
              statincrease: player.hasArmourIncrease,
              statdecrease: player.hasArmourDecrease,
            }"
            >{{ player.armourStat }}+</span
          >
        </div>
      </template>
      <div v-if="!player.IsEmpty" class="cell skills">
        <div
          class="positionskills"
          :title="player.getPositionSkills().join(', ')"
        >
          {{ player.getPositionSkills().join(", ") }}
        </div>
        <div class="playerskills" :title="player.getSkills().join(', ')">
          {{ player.getSkills().join(", ") }}
          <template v-if="player.getIsJourneyman()">Loner</template>
        </div>
      </div>
      <div
        v-if="!player.IsEmpty"
        class="cell injuries"
        :title="
          'Injuries in chronological order: ' + player.getInjuries().join(',')
        "
      >
        {{ displayInjuries(player.getInjuries()) }}
      </div>
      <div v-if="!player.IsEmpty" class="cell spp" :title="sppSummaryText">
        <template v-if="player.IsLegend"
          >Legend
          <div class="legendspptotal">{{ sppDisplayInfo.total }}</div>
        </template>
        <template v-else-if="player.getPosition().isPeaked">
          <div>Peak-{{ sppDisplayInfo.spendable }}</div>
        </template>
        <template v-else>
          <span class="spendable">{{ sppDisplayInfo.spendable }}/</span
          ><span class="maxlimit">{{ sppDisplayInfo.maxLimit }}</span>
          <div class="tierinfo">
            <span v-for="n in sppDisplayInfo.tier" :key="n">•</span>
          </div>
        </template>
      </div>
      <div v-if="!player.IsEmpty" class="cell cost">
        <div class="costbasic">{{ player.getPlayerCost() / 1000 }}k</div>
        <div class="costbreakdown">
          {{ player.getPositionCost() / 1000 }}+{{
            player.getSkillCost() / 1000
          }}
        </div>
      </div>
      <div
        v-if="!player.IsEmpty && accessControl.canCreate()"
        class="cell removenewplayer"
      >
        <template v-if="!player.getIsJourneyman()">
          (<a href="#" @click.prevent="triggerRemovePlayer">Remove</a>)
        </template>
      </div>
      <div
        v-else-if="!player.IsEmpty && accessControl.canEdit()"
        class="cell retireplayer"
      >
        <template v-if="!teamStatus.isSkill() && !player.getIsJourneyman()">
          <template v-if="player.getIsRefundable()">
            (<a href="#" @click.prevent="triggerRefundPlayer">Refund</a>)
          </template>
          <template v-else>
            (<a href="#" @click.prevent="triggerNominateRetirePlayer">Retire</a
            >)
          </template>
        </template>
        <template
          v-else-if="
            !teamStatus.isSkill() && treasury >= player.getPlayerCost()
          "
        >
          (<a href="#" @click.prevent="triggerHireJourneyman">Hire</a>)
        </template>
        <template v-if="player.canSkill">
          <a
            :class="{ mustskill: player.mustSkill }"
            href="#"
            @click.prevent="triggerSkillPlayer"
          >
            {{ player.mustSkill ? "Must " : "" }}Skill
          </a>
        </template>
      </div>
    </div>
    <div class="foldout foldoutmore" :class="{ active: isFoldOutMore }">
      <playerdetails
        :fumbbl-api="fumbblApi"
        :player="player"
        :can-edit="accessControl.canEdit()"
        :name-generator="nameGenerator"
        @close="performFoldOut('CLOSED')"
      ></playerdetails>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import { PlayerRowFoldOutMode } from "../include/Interfaces";
import PlayerDetailsComponent from "./PlayerDetails.vue";
import FumbblApi from "../include/FumbblApi";
import AccessControl from "../include/AccessControl";
import RosterIconManager from "../include/RosterIconManager";
import {
  EventDataFoldOut,
  EventDataRefundPlayer,
  EventDataRemovePlayer,
} from "../include/EventDataInterfaces";
import Player from "../include/Player";
import TeamStatus from "../include/TeamStatus";

@Component({
  components: {
    playerdetails: PlayerDetailsComponent,
  },
})
class PlayerComponent extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: Object as PropType<Player>,
    required: true,
  })
  public player!: Player;

  @Prop({
    type: Object as PropType<AccessControl>,
    required: true,
  })
  public accessControl!: AccessControl;

  @Prop({
    type: Object as PropType<RosterIconManager>,
    required: true,
  })
  public rosterIconManager!: RosterIconManager;

  @Prop({
    type: String,
    required: true,
  })
  public nameGenerator!: string;

  @Prop({
    type: Boolean,
    required: true,
  })
  public compactView!: boolean;

  @Prop({
    type: TeamStatus,
    required: true,
  })
  public teamStatus!: TeamStatus;

  @Prop({
    type: Number,
    required: true,
  })
  public treasury!: number;

  @Emit("remove-player")
  public triggerRemovePlayer(): EventDataRemovePlayer {
    const player = this.player;
    return {
      playerNumber: this.player.playerNumber,
      playerId: player ? player.id : 0,
    };
  }

  @Emit("refund-player")
  public triggerRefundPlayer(): EventDataRefundPlayer {
    const player = this.player;
    return {
      playerNumber: this.player.playerNumber,
      playerId: player.id,
    };
  }

  @Emit("nominate-retire-player")
  public triggerNominateRetirePlayer(): Player {
    return this.player!;
  }

  @Emit("hire-journeyman")
  public triggerHireJourneyman(): Player {
    return this.player!;
  }

  @Emit("skill-player")
  public triggerSkillPlayer(): Player {
    return this.player!;
  }

  @Emit("fold-out")
  public triggerFoldOut(eventDataFoldOut: EventDataFoldOut): EventDataFoldOut {
    return eventDataFoldOut;
  }

  @Emit("show-hire-rookies")
  public triggerShowHireRookies() {}

  readonly delayForFoldoutAnimations = 600;
  private intervalIdsScrollDuringCssTransition: number[] = [];

  public get key() {
    return this.player.key;
  }

  public getKey() {
    return this.key;
  }

  private mounted() {
    this.$el
      .getElementsByClassName("foldout")[0]
      .addEventListener("transitionend", () => {
        this.clearIntervalIdsScrollDuringCssTransition();
      });
  }

  private created() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private destroyed() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      if (this.isFoldOutMore) {
        event.preventDefault();
        this.performFoldOut("CLOSED", true);
      }
    }
  }

  public get isFoldOutMore(): boolean {
    return this.player.foldOut === "MORE";
  }

  public performFoldOut(
    playerRowFoldOutMode: PlayerRowFoldOutMode,
    multipleOpenMode = false,
  ) {
    this.triggerFoldOut({
      playerNumber: this.player.playerNumber,
      playerRowFoldOutMode,
      multipleOpenMode,
    });
    this.enableSmartScroll();
  }

  private enableSmartScroll() {
    this.clearIntervalIdsScrollDuringCssTransition();
    const onlyRunUntil = Date.now() + 1000;
    const intervalId = setInterval(() => {
      // prevent running indefinitely on a cancelled transition
      if (Date.now() > onlyRunUntil) {
        this.clearIntervalIdsScrollDuringCssTransition();
        return;
      }

      // when bottom of player row extends past end of screen
      if (this.$el.getBoundingClientRect().bottom > window.innerHeight) {
        this.$el.scrollIntoView({ behavior: "smooth", block: "end" });
      }

      // when top of player row extends above start of screen
      if (this.$el.getBoundingClientRect().top < 0) {
        this.$el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    this.intervalIdsScrollDuringCssTransition.push(intervalId);
  }

  private clearIntervalIdsScrollDuringCssTransition() {
    for (const intervalId of this.intervalIdsScrollDuringCssTransition) {
      clearInterval(intervalId);
    }
    this.intervalIdsScrollDuringCssTransition = [];
  }

  public toggleFoldOutMore(multipleOpenMode: boolean) {
    if (this.isFoldOutMore) {
      this.performFoldOut("CLOSED", multipleOpenMode);
    } else {
      this.performFoldOut("MORE", multipleOpenMode);
    }
  }

  public displayInjuries(injuries: string[]): string {
    let niggleCount = 0;
    const displayInjuries: string[] = [];

    for (const injury of injuries) {
      if (injury === "n") {
        niggleCount++;
      } else {
        displayInjuries.push(injury);
      }
    }
    if (niggleCount > 0) {
      if (niggleCount === 1) {
        displayInjuries.push("n");
      } else {
        displayInjuries.push(`n${niggleCount}`);
      }
    }

    return displayInjuries.sort().join(", ");
  }

  public get sppDisplayInfo(): any {
    return this.player.sppDisplayInfo;
  }

  public get sppSummaryText(): string {
    if (this.player.IsLegend) {
      return "Player has reached Legend.";
    }

    const spendable = this.sppDisplayInfo.spendable;

    const randomPrimaryThreshold = this.sppDisplayInfo.thresholds.randomPrimary;
    const randomPrimaryRequired =
      randomPrimaryThreshold <= spendable
        ? 0
        : randomPrimaryThreshold - spendable;

    const randomSecondaryOrChosenPrimaryThreshold =
      this.sppDisplayInfo.thresholds.randomSecondaryOrChosenPrimary;
    const randomSecondaryOrChosenPrimaryRequired =
      randomSecondaryOrChosenPrimaryThreshold <= spendable
        ? 0
        : randomSecondaryOrChosenPrimaryThreshold - spendable;

    const chosenSecondaryThreshold =
      this.sppDisplayInfo.thresholds.chosenSecondary;
    const chosenSecondaryRequired =
      chosenSecondaryThreshold <= spendable
        ? 0
        : chosenSecondaryThreshold - spendable;

    const characteristicThreshold =
      this.sppDisplayInfo.thresholds.characteristic;
    const characteristicRequired =
      characteristicThreshold <= spendable
        ? 0
        : characteristicThreshold - spendable;

    return (
      `${randomPrimaryRequired} until random primary (${spendable}/${randomPrimaryThreshold})\n` +
      `${randomSecondaryOrChosenPrimaryRequired} until random secondary or chosen primary (${spendable}/${randomSecondaryOrChosenPrimaryThreshold})\n` +
      `${chosenSecondaryRequired} until chosen secondary (${spendable}/${chosenSecondaryThreshold})\n` +
      `${characteristicRequired} until characteristic (${spendable}/${characteristicThreshold})`
    );
  }
}

export default toNative(PlayerComponent);
</script>
