<template>
  <modal
    :button-settings="{
      cancel: { enabled: true, label: 'Never mind' },
      extra: [
        {
          enabled: canTemporaryRetire(),
          label: 'Temporarily retire player',
        },
      ],
      confirm: { enabled: true, label: 'Retire player' },
    }"
    :modal-size="'medium'"
    @cancel="triggerNominateRetirePlayerCancel"
    @confirm="triggerNominateRetirePlayerConfirm"
    @extra="triggerNominateTemporaryRetirePlayer"
  >
    <template v-slot:header> Retire player? </template>

    <template v-slot:body>
      <template v-if="errors.length === 0">
        <p>Are you sure you want to retire the following player?</p>
        <PlayerCard ref="playerCard" :narrow="false" />
      </template>
      <template v-else>
        <p>
          Unable to retire player. Please try fully reloading the page to fix
          this problem. If the problem persists please contact support with the
          following error details.
        </p>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </template>
    </template>
  </modal>
</template>

<script lang="ts">
import { PropType } from "vue";
import {
  Prop,
  Component,
  Vue,
  toNative,
  Emit,
  Ref,
} from "vue-facing-decorator";
import ModalComponent from "./Modal.vue";
import Player from "../include/Player";
import FumbblApi from "../include/FumbblApi";
import PlayerCard from "./PlayerCard.vue";

@Component({
  components: {
    modal: ModalComponent,
    PlayerCard,
  },
})
class RetirePlayerComponent extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public player!: Player;

  @Prop({
    required: true,
  })
  public seasonsEnabled!: boolean;

  @Emit("nominate-retire-player-cancel")
  public triggerNominateRetirePlayerCancel() {}

  @Emit("nominate-retire-player-confirm")
  public triggerNominateRetirePlayerConfirm() {}

  @Emit("nominate-temporary-retire-player")
  public triggerNominateTemporaryRetirePlayer() {
    console.log("triggerNominateTemporaryRetirePlayer");
  }

  @Ref
  public playerCard: InstanceType<typeof PlayerCard> | undefined;

  public errors: string[] = [];

  async mounted() {
    const apiResponse = await this.fumbblApi.getPlayer(this.player.id);
    if (apiResponse.isSuccessful()) {
      const rawApiPlayer = apiResponse.getData();
      this.validatePlayer(rawApiPlayer);
    } else {
      this.errors.push("Unable to verify player details.");
    }

    this.playerCard?.setPlayer(this.player);
    // some way to safely reload the team when errors exist.
  }

  public canTemporaryRetire(): boolean {
    if (!this.seasonsEnabled) {
      return false;
    }

    if (this.player.IsExtraPlayer) {
      return false;
    }

    if (this.player.IsTemporarilyRetired) {
      return false;
    }

    const injuries = this.player.getInjuryStatus();

    if (injuries == null) {
      return false;
    }

    if (!this.player.team.getTeamStatus().isPostMatch()) {
      return false;
    }

    let allow: boolean = false;
    for (let i of injuries) {
      if (i.lasting && i.lastMatch) {
        allow = true;
      }
    }

    return allow;
  }

  private validatePlayer(rawApiPlayer: any) {
    if (
      rawApiPlayer.status !== "Active" &&
      rawApiPlayer.status !== "Temporarily Retired"
    ) {
      this.errors.push("This player is not active.");
    }

    if (this.player.playerNumber !== rawApiPlayer.number) {
      this.errors.push(
        "Local player number is out of sync with saved player number.",
      );
    }

    if (this.player.getPositionId() !== rawApiPlayer.position.id) {
      this.errors.push("Invalid player position.");
    }

    if (this.player.getPlayerName() !== rawApiPlayer.name) {
      this.errors.push(
        "Local player name is out of sync with saved player name.",
      );
    }

    if (this.player.getRecord().spp.total !== rawApiPlayer.statistics.spp) {
      this.errors.push("Local SPP out of sync with saved SPP.");
    }

    // api data includes miss next game injuries twice, for this purpose we can ignore any containing '(MNG)'
    const rawApiPlayerInjuryCountWithoutDuplicates =
      rawApiPlayer.injuries.filter(
        (injury: any) => !injury.includes("(MNG)"),
      ).length;
    if (
      this.player.getInjuries().length !==
      rawApiPlayerInjuryCountWithoutDuplicates
    ) {
      this.errors.push("Local injuries out of sync with saved injuries.");
    }

    if (
      this.player.getSkills().length +
        this.player.getPositionSkills().length !==
      rawApiPlayer.skills.length
    ) {
      this.errors.push("Local skills out of sync with saved skills.");
      this.errors.push("Player Skills: " + this.player.getSkills().length);
      this.errors.push(
        "Position Skills: " + this.player.getPositionSkills().length,
      );
      this.errors.push("API Skills: " + rawApiPlayer.skills.length);
    }
  }
}

export default toNative(RetirePlayerComponent);
</script>
