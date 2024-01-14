<template>
  <div class="teammanagement">
    <team
      v-if="teamReady"
      :fumbbl-api="fumbblApi"
      :coach-name="coachName"
      :team-id="teamId"
      :isSiteStaff="isSiteStaff"
      :isLeagueStaff="isLeagueStaff"
      @unexpected-error="handleUnexpectedError"
      @delete-team="handleDeleteTeam"
    ></team>

    <modal
      v-if="unexpectedErrorMessage"
      :button-settings="{
        cancel: { enabled: false, label: '' },
        confirm: { enabled: false, label: '' },
      }"
      :modal-size="'small'"
      :exclude-close-top-right="true"
    >
      <template v-slot:header> Unexpected error. </template>

      <template v-slot:body>
        <p>
          Unfortunately an unexpected error has occurred, please reload this
          page before continuing.
        </p>
        <p>Error message: {{ unexpectedErrorMessage }}</p>
      </template>
    </modal>

    <modal
      v-if="teamDeleted"
      :modal-size="'small'"
      :exclude-close-top-right="true"
    >
      <template v-slot:header> Team deleted. </template>

      <template v-slot:body>
        <p>
          Team successfully deleted, you will shortly be redirected to your
          coach homepage.
        </p>
        <div><a href="`https://fumbbl.com/~`">Go to coach homepage</a></div>
      </template>
    </modal>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-facing-decorator";
import TeamComponent from "./components/Team.vue";
import FumbblApi from "./include/FumbblApi";
import ModalComponent from "./components/Modal.vue";

@Component({
  components: {
    modal: ModalComponent,
    team: TeamComponent,
  },
})
export default class TeamManagement extends Vue {
  public teamId: number = 0;
  public coachName: string = "";
  public fumbblApi?: FumbblApi = undefined;
  public unexpectedErrorMessage?: string = undefined;
  public teamDeleted: boolean = false;
  public isLeagueStaff: boolean = false;
  public isSiteStaff: boolean = false;

  mounted() {
    this.fumbblApi = new FumbblApi();

    const teamIdFromAttribute = document
      .getElementById("app")!
      .getAttribute("teamid");
    const siteStaffFromAttribute = document
      .getElementById("app")!
      .getAttribute("sitestaff");
    const leagueStaffFromAttribute = document
      .getElementById("app")!
      .getAttribute("leaguestaff");
    this.teamId = Number(teamIdFromAttribute);
    this.isSiteStaff = (/true/i).test(siteStaffFromAttribute);
    this.isLeagueStaff = (/true/i).test(leagueStaffFromAttribute);

    const coachName = document.getElementById("app")!.getAttribute("coach")!;
    this.coachName = coachName;
  }

  public get teamReady(): boolean {
    return (
      this.fumbblApi !== undefined &&
      this.unexpectedErrorMessage === undefined &&
      !this.teamDeleted
    );
  }

  public handleUnexpectedError(errorMessage: string) {
    this.unexpectedErrorMessage = errorMessage;
  }

  public handleDeleteTeam() {
    this.teamDeleted = false;
    setTimeout(() => (window.location.href = `https://fumbbl.com/~`), 1000);
  }
}
</script>
