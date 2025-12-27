<template>
  <div class="playerdetails">
    <a v-if="debug" class="editIcon" href="#" @click.prevent="showIconEditor"
      >Edit icon</a
    >
    <div class="playerdetailssection playerdetailsedit" v-if="canEdit">
      <div class="title">Edit player details</div>
      <template v-if="updatePlayerDetails">
        <div class="playername">
          <label :for="'playerName_' + player.playerNumber">Name</label>
          <input
            :id="'playerName_' + player.playerNumber"
            v-model="updatePlayerDetails.playerName"
            type="text"
          />
          <a href="#" @click.prevent="generatePlayerName"
            >Generate random name</a
          >
        </div>
        <div class="playergender">
          <label :for="'gender_' + player.playerNumber">Gender</label>
          <select
            :id="'gender_' + player.playerNumber"
            v-model="updatePlayerDetails.gender"
          >
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NONBINARY">Non-Binary</option>
          </select>
        </div>
        <div
          v-for="error in updatePlayerDetailsErrors"
          :key="error"
          class="errormessages"
        >
          <div v-if="error === 'empty_name'">Please enter a name.</div>
          <div v-if="error === 'empty_gender'">Please select a Gender.</div>
        </div>
        <div>
          <button class="teambutton" @click="saveUpdatedPlayerDetails">
            Save
          </button>
          <button
            class="teambutton"
            @click="triggerClose"
            style="margin-left: 20px"
          >
            Cancel
          </button>
          <button
            v-if="
              accessControl.canUndoTempRetire() && player.IsTemporarilyRetired
            "
            class="teambutton"
            @click="undoTempRetirement"
          >
            Undo Temporary Retirement
          </button>
        </div>
      </template>
    </div>
    <div class="playerdetailssection playerdetailsrecord">
      <a
        v-if="player && canEdit"
        :href="`/p/player?player_id=${player.id}`"
        style="float: right"
        >Manage player</a
      >
      <a
        v-if="player && !canEdit"
        :href="`/p/player?player_id=${player.id}`"
        style="float: right"
        >Player Details</a
      >
      <div class="title">Details</div>
      <table class="playerstats">
        <tbody>
          <tr>
            <td>{{ player ? player.getRecord().games : "0" }}</td>
            <td>Games played</td>
          </tr>
          <tr>
            <td>{{ player ? player.getRecord().completions : "0" }}</td>
            <td>Completions</td>
          </tr>
          <tr>
            <td>{{ player ? player.getRecord().touchdowns : "0" }}</td>
            <td>Touchdowns</td>
          </tr>
          <tr>
            <td>{{ player ? player.getRecord().deflections : "0" }}</td>
            <td>Deflections</td>
          </tr>
          <tr>
            <td>{{ player ? player.getRecord().interceptions : "0" }}</td>
            <td>Interceptions</td>
          </tr>
          <tr>
            <td>{{ player ? player.getRecord().casualties : "0" }}</td>
            <td>Casualties</td>
          </tr>
          <tr>
            <td>{{ player ? player.getRecord().mvps : "0" }}</td>
            <td>MVPs</td>
          </tr>
        </tbody>
      </table>
    </div>
    <modal
      v-if="errorModalInfo !== null"
      :button-settings="{
        cancel: { enabled: true, label: 'Close' },
        confirm: { enabled: false, label: '' },
      }"
      :modal-size="'small'"
      @cancel="errorModalInfo = null"
    >
      <template v-slot:header> Error </template>

      <template v-slot:body>
        <p>{{ errorModalInfo }}</p>
        <p>Technical details: {{ errorModalInfo }}</p>
      </template>
    </modal>
  </div>

  <IconEditor :fumbblApi="fumbblApi" :player="player" ref="iconEditor" />
</template>

<script lang="ts">
import { PropType } from "vue";
import {
  Prop,
  Component,
  Vue,
  toNative,
  Emit,
  Watch,
  Ref,
} from "vue-facing-decorator";
import UpdatePlayerDetails from "../include/UpdatePlayerDetails";
import ModalComponent from "./Modal.vue";
import IconEditor from "./modals/IconEditor.vue";
import FumbblApi from "../include/FumbblApi";
import Player from "../include/Player";
import { PlayerRowFoldOutMode } from "../include/Interfaces";
import AccessControl from "../include/AccessControl";

@Component({
  components: {
    modal: ModalComponent,
    IconEditor: IconEditor,
  },
})
class PlayerDetailsComponent extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: Boolean,
    required: true,
  })
  public canEdit!: boolean;

  @Prop({
    type: Object as PropType<Player>,
    required: true,
  })
  public player!: Player;

  @Prop({
    type: String,
    required: true,
  })
  public nameGenerator!: string;

  @Prop({
    type: Object as PropType<AccessControl>,
    required: true,
  })
  public accessControl!: AccessControl;

  @Emit("close")
  public triggerClose() {}

  @Watch("player.foldOut")
  playerFoldOutWatcher(newValue: PlayerRowFoldOutMode) {
    if (newValue === "CLOSED") {
      this.refreshUpdatePlayerDetails();
    }
  }

  @Ref
  public iconEditor: InstanceType<typeof IconEditor> | undefined;

  public dataUpdatePlayerDetails?: UpdatePlayerDetails = undefined;
  public updatePlayerDetailsErrors: string[] = [];
  public errorModalInfo: { general: string; technical: string } | null = null;

  public debug = import.meta.env.MODE == "localdev";

  public get updatePlayerDetails(): UpdatePlayerDetails {
    return this.dataUpdatePlayerDetails!;
  }

  mounted() {
    this.refreshUpdatePlayerDetails();
  }

  private refreshUpdatePlayerDetails() {
    this.dataUpdatePlayerDetails = new UpdatePlayerDetails(
      this.player.getPlayerName(),
      this.player.getGender(),
    );
  }

  public async undoTempRetirement() {
    if (!this.player) {
      return;
    }

    const apiResponse = await this.fumbblApi.undoTempRetirement(
      this.player.team.id,
      this.player.id,
    );
    if (apiResponse.isSuccessful()) {
      this.player.undoTemporaryRetired();
    } else {
      this.errorModalInfo = {
        general: "An error occurred undoing temporary retirement.",
        technical: apiResponse.getErrorMessage(),
      };
    }
    this.triggerClose();
  }

  public async saveUpdatedPlayerDetails() {
    if (!this.player) {
      return;
    }

    if (this.updatePlayerDetails) {
      this.updatePlayerDetailsErrors = this.updatePlayerDetails.getErrors();
    }

    if (this.updatePlayerDetailsErrors.length === 0) {
      const apiResponse = await this.fumbblApi.updatePlayer(
        this.player.id,
        this.updatePlayerDetails.getPlayerName(),
        this.updatePlayerDetails.getGender(),
      );
      if (apiResponse.isSuccessful()) {
        this.player.updatePlayerDetails(this.updatePlayerDetails);
      } else {
        this.errorModalInfo = {
          general: "An error occurred updating player details.",
          technical: apiResponse.getErrorMessage(),
        };
      }
      this.triggerClose();
    }
  }

  public async generatePlayerName(): Promise<void> {
    const apiResponse = await this.fumbblApi.generatePlayerName(
      this.nameGenerator,
      this.updatePlayerDetails.getGender(),
    );
    if (apiResponse.isSuccessful()) {
      const playerName = apiResponse.getData();
      this.updatePlayerDetails.setPlayerName(playerName);
    } else {
      this.errorModalInfo = {
        general: "An error occurred generating a new player name.",
        technical: apiResponse.getErrorMessage(),
      };
    }
  }

  public showIconEditor(): void {
    this.iconEditor?.show();
  }
}

export default toNative(PlayerDetailsComponent);
</script>
