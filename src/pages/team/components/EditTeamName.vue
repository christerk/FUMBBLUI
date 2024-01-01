<template>
  <div class="teamname">
    <div class="teamnamecontent">
      <template v-if="editTeamName && canEdit">
        <input v-model="newTeamName" class="editteamname" />
        <button class="teambutton" @click="save">Save</button>
        <a href="#" @click.prevent="cancel">Cancel</a>
      </template>
      <template v-else>
        <div class="teamnametext">{{ teamName }}</div>
        <div v-if="canEdit" class="editlink">
          <a href="#" @click.prevent="begin">edit name</a>
        </div>
      </template>
    </div>
    <modal
      v-if="validationErrors.length !== 0"
      :button-settings="{
        cancel: { enabled: true, label: 'Close' },
        confirm: { enabled: false, label: '' },
      }"
      :modal-size="'small'"
      @cancel="validationErrors = []"
    >
      <template v-slot:header> Error </template>

      <template v-slot:body>
        <p>Unable to edit team name, please see the issues below.</p>
        <ul>
          <li v-for="error in validationErrors" :key="error">
            {{ error }}
          </li>
        </ul>
      </template>
    </modal>
  </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import modal from "./Modal.vue";
import FumbblApi from "../include/FumbblApi";

@Component({
  components: {
    modal,
  },
})
class EditTeamNameComponent extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: String,
    required: true,
  })
  public teamName!: string;

  @Prop({
    type: Boolean,
    required: true,
  })
  public canEdit!: boolean;

  @Emit("begin")
  public triggerBegin() {}

  @Emit("cancel")
  public triggerCancel() {}

  @Emit("edit")
  public triggerEdit(newTeamName: string) {
    return newTeamName;
  }

  public newTeamName: string = "";
  public editTeamName: boolean = false;
  public validationErrors: string[] = [];

  private async refreshValidationErrors() {
    const errors = [];

    if (this.newTeamName === this.teamName) {
      errors.push("The team name has not been altered.");
    }

    if (this.newTeamName.length < 2) {
      errors.push("The team name must be at least two characters long.");
    }

    if (this.newTeamName.toUpperCase() === this.newTeamName) {
      errors.push("The team name can't be entirely upper case.");
    }

    if (this.newTeamName.slice(0, 4).toLowerCase() === "the ") {
      errors.push('The team name can\' t start with the word "The".');
    }

    if (this.newTeamName.charAt(this.newTeamName.length - 1) === ".") {
      errors.push("The team name can't end with a period.");
    }

    if (
      ["/", "\\", "?", '"', "&", "#", "+", ":", "*"].some(
        (excludeMe) => this.newTeamName.indexOf(excludeMe) >= 0,
      )
    ) {
      errors.push('The team name can\'t include any of "/ \\ ? " & # + : *"');
    }

    if (errors.length === 0) {
      const apiResponse = await this.fumbblApi.checkTeamName(this.newTeamName);
      if (!apiResponse.isSuccessful()) {
        errors.push(apiResponse.getErrorMessage());
      }
    }

    this.validationErrors = errors;
  }

  public begin(): void {
    this.validationErrors = [];
    this.editTeamName = true;
    this.newTeamName = this.teamName;
    this.triggerBegin();
  }

  public cancel(): void {
    this.validationErrors = [];
    this.newTeamName = "";
    this.editTeamName = false;
    this.triggerCancel();
  }

  public async save() {
    this.validationErrors = [];
    await this.refreshValidationErrors();
    if (this.validationErrors.length === 0) {
      this.triggerEdit(this.newTeamName);
      this.editTeamName = false;
    }
  }
}

export default toNative(EditTeamNameComponent);
</script>
