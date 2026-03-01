<template>
  <div class="specialrules">
    <template v-if="!updateInProgress">
      <template v-if="!canEdit">
        {{ displayNames.join(", ") }}
      </template>
      <template v-else>
        <template v-if="isOneOfActive">
          <template v-if="showOneOfOptions">
            <select @change="changeOneOf">
              <option value="">Choose League</option>
              <template v-for="oneOfOption in oneOfOptions" :key="oneOfOption">
                <option :value="oneOfOption">{{ oneOfOption }}</option>
              </template>
            </select>
          </template>
          <template v-else>
            <a @click.prevent="showOneOfOptions = !showOneOfOptions" href="#"
              >Choose league:
            </a>
          </template>
        </template>
        <template
          v-for="(specialRuleLabel, index) in leagueLabels"
          :key="index"
        >
          <span>
            <span
              v-if="index !== 0"
              :class="{ oneofseparator: isOneOfActive }"
              >{{ isOneOfActive ? "OR" : ", " }}</span
            >
            <template v-if="labelHasOptions(specialRuleLabel)">
              <template v-if="showTeamOptions">
                <select @change="changeTeamOption">
                  <template v-if="!labelHasChoice(specialRuleLabel)">
                    <option value="">Choose Special Rule</option>
                  </template>
                  <template
                    v-for="specialRuleOption in teamOptions[specialRuleLabel]"
                    :key="specialRuleOption"
                  >
                    <option
                      :value="specialRuleLabel + '|' + specialRuleOption"
                      :selected="
                        getLabelChoice(specialRuleLabel) === specialRuleOption
                      "
                    >
                      {{ specialRuleOption }}
                    </option>
                  </template>
                </select>
              </template>
              <template v-else>
                {{ oneOfChoice === specialRuleLabel ? "✓" : ""
                }}<a
                  @click.prevent="showTeamOptions = !showTeamOptions"
                  href="#"
                  :class="{ oneofchosen: selectedLeague === specialRuleLabel }"
                  >{{ getLabelChoice(specialRuleLabel) }}
                </a>
              </template>
            </template>
            <template v-else>
              <span
                :class="{ oneofchosen: selectedLeague === specialRuleLabel }"
                >{{ oneOfChoice === specialRuleLabel ? "✓" : ""
                }}{{ specialRuleLabel }}</span
              >
            </template>
          </span>
        </template>
        &mdash; Special Rules:
        <template
          v-for="(specialRuleLabel, index) in specialRuleLabels"
          :key="index"
        >
          <span>
            <span v-if="index !== 0">, </span>
            <template v-if="labelHasOptions(specialRuleLabel)">
              <template v-if="showTeamOptions">
                <select @change="changeTeamOption">
                  <template v-if="!labelHasChoice(specialRuleLabel)">
                    <option value="">Choose Special Rule</option>
                  </template>
                  <template
                    v-for="specialRuleOption in teamOptions[specialRuleLabel]"
                    :key="specialRuleOption"
                  >
                    <option
                      :value="specialRuleLabel + '|' + specialRuleOption"
                      :selected="
                        getLabelChoice(specialRuleLabel) === specialRuleOption
                      "
                    >
                      {{ specialRuleOption }}
                    </option>
                  </template>
                </select>
              </template>
              <template v-else>
                {{ oneOfChoice === specialRuleLabel ? "✓" : ""
                }}<a
                  @click.prevent="showTeamOptions = !showTeamOptions"
                  href="#"
                  :class="{ oneofchosen: selectedLeague === specialRuleLabel }"
                  >{{ getLabelChoice(specialRuleLabel) }}
                </a>
              </template>
            </template>
            <template v-else>
              <span
                :class="{ oneofchosen: selectedLeague === specialRuleLabel }"
                >{{ oneOfChoice === specialRuleLabel ? "✓" : ""
                }}{{ specialRuleLabel }}</span
              >
            </template>
          </span>
        </template>
        <span v-if="specialRuleLabels.length === 0"> None </span>
      </template>
    </template>
    <template v-else> Please wait updating special rules. </template>
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
</template>

<script lang="ts">
import { PropType } from "vue";
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import FumbblApi from "../include/FumbblApi";
import modal from "./Modal.vue";
import { RawApiSpecialRules } from "../include/Interfaces";

@Component({
  components: {
    modal,
  },
})
class SpecialRules2025Component extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: Number,
    required: true,
  })
  public teamId!: number;

  @Prop({
    type: Boolean,
    required: true,
  })
  public canEdit!: boolean;

  @Prop({
    type: Object as PropType<RawApiSpecialRules>,
    required: true,
  })
  public rawApiSpecialRules!: RawApiSpecialRules;

  @Emit("rules-updated")
  public triggerRulesUpdated() {
    return () => {
      this.updateInProgress = false;
    };
  }

  private readonly ONE_OF_ID = "-3";
  public showOneOfOptions = false;
  public showTeamOptions = false;
  public updateInProgress = false;
  public errorModalInfo: { general: string; technical: string } | null = null;

  public get isOneOfActive(): boolean {
    return this.oneOfOptions.length > 1;
  }

  public get oneOfDisplayName(): string {
    if (!this.isOneOfActive) {
      return "";
    }

    if (Object.keys(this.teamChoices).includes(this.oneOfChoice)) {
      return this.teamChoices[this.oneOfChoice];
    }

    if (this.oneOfChoice) {
      return this.oneOfChoice;
    }

    return "";
  }

  public getLabelChoice(label: string): string {
    if (this.labelHasChoice(label)) {
      return this.teamChoices[label];
    }
    return label;
  }

  public labelHasChoice(label: string): boolean {
    return (
      Object.keys(this.teamChoices).includes(label) && this.teamChoices[label]
    );
  }

  public labelHasOptions(label: string): boolean {
    return Object.keys(this.teamOptions).includes(label);
  }

  public get leagueLabels(): string[] {
    const specialRuleLabels = [];
    const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
    for (const rosterSpecialRule of rosterSpecialRules) {
      if (!rosterSpecialRule.isLeague) {
        continue;
      }
      const label = rosterSpecialRule.option
        ? rosterSpecialRule.option
        : rosterSpecialRule.name;
      specialRuleLabels.push(label);
    }
    return specialRuleLabels;
  }

  public get specialRuleLabels(): string[] {
    const specialRuleLabels = [];
    const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
    for (const rosterSpecialRule of rosterSpecialRules) {
      if (
        rosterSpecialRule.id === this.ONE_OF_ID ||
        rosterSpecialRule.isLeague
      ) {
        continue;
      }
      const label = rosterSpecialRule.option
        ? rosterSpecialRule.option
        : rosterSpecialRule.name;
      specialRuleLabels.push(label);
    }
    return specialRuleLabels;
  }

  public get displayNames(): string[] {
    const displayNames: string[] = [];

    const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
    for (const rosterSpecialRule of rosterSpecialRules) {
      let displayName = rosterSpecialRule.name;

      if (rosterSpecialRule.isLeague) {
        continue;
      }

      if (Object.keys(this.teamChoices).includes(rosterSpecialRule.name)) {
        displayName = this.teamChoices[rosterSpecialRule.name];
      }

      displayNames.push(displayName);
    }

    displayNames.unshift(this.selectedLeague);
    return displayNames;
  }

  private get teamChoices(): any {
    const teamChoices: any = {};
    const teamSpecialRules = this.rawApiSpecialRules.fromTeam;
    for (const specialRuleLabel of Object.keys(teamSpecialRules)) {
      const teamSpecialRule = teamSpecialRules[specialRuleLabel];
      const teamSpecialRuleOptions = teamSpecialRule[0];
      const teamSpecialRuleChoice = teamSpecialRule[1];
      const teamSpecialRuleSettings = teamSpecialRule[2];
      if (
        typeof teamSpecialRuleSettings === "object" &&
        teamSpecialRuleSettings !== null
      ) {
        if (teamSpecialRuleSettings.oneOf === true) {
          continue;
        }
      }
      if (teamSpecialRuleOptions) {
        teamChoices[specialRuleLabel] = teamSpecialRuleChoice;
      }
    }
    return teamChoices;
  }

  public get teamOptions(): any {
    const teamOptions: any = {};
    const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
    for (const rosterSpecialRule of rosterSpecialRules) {
      if (rosterSpecialRule.id === this.ONE_OF_ID) {
        continue;
      }
      if (
        rosterSpecialRule.options === null ||
        (rosterSpecialRule.option !== null && rosterSpecialRule.option !== "")
      ) {
        continue;
      }
      let finalOptions = JSON.parse(rosterSpecialRule.options);
      if (
        rosterSpecialRule.filter !== null &&
        rosterSpecialRule.filter !== ""
      ) {
        finalOptions = rosterSpecialRule.filter.split("|");
      }
      teamOptions[rosterSpecialRule.name] = finalOptions;
    }
    return teamOptions;
  }

  public get oneOfChoice(): any {
    const teamSpecialRules = this.rawApiSpecialRules.fromTeam;
    for (const specialRuleLabel of Object.keys(teamSpecialRules)) {
      const teamSpecialRule = teamSpecialRules[specialRuleLabel];
      const teamSpecialRuleChoice = teamSpecialRule[1];
      const teamSpecialRuleSettings = teamSpecialRule[2];
      if (
        typeof teamSpecialRuleSettings === "object" &&
        teamSpecialRuleSettings !== null
      ) {
        if (teamSpecialRuleSettings.oneOf === true) {
          return teamSpecialRuleChoice;
        }
      }
    }
    return null;
  }

  public get selectedLeague(): any {
    const teamSpecialRules = this.rawApiSpecialRules.fromTeam;
    for (const specialRuleLabel of Object.keys(teamSpecialRules)) {
      const teamSpecialRule = teamSpecialRules[specialRuleLabel];
      const teamSpecialRuleSettings = teamSpecialRule[2];
      if (
        typeof teamSpecialRuleSettings === "object" &&
        teamSpecialRuleSettings !== null
      ) {
        if (teamSpecialRuleSettings.selectedLeague === true) {
          return specialRuleLabel;
        }
      }
    }
    return null;
  }

  public get oneOfOptions(): any {
    const oneOfOptions = [];
    let oneOfIsActive = false;
    const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
    for (const rosterSpecialRule of rosterSpecialRules) {
      if (rosterSpecialRule.isLeague) {
        oneOfOptions.push(rosterSpecialRule.name);
      }
    }
    return oneOfOptions;
  }

  private get oneOfRuleName(): string {
    const rosterSpecialRules = this.rawApiSpecialRules.fromRoster;
    for (const rosterSpecialRule of rosterSpecialRules) {
      if (rosterSpecialRule.id === this.ONE_OF_ID) {
        return rosterSpecialRule.name;
      }
    }
    return "";
  }

  public async changeOneOf(event: any) {
    const newSpecialRuleValue = event.target.value;
    if (newSpecialRuleValue) {
      await this.setSpecialRule(newSpecialRuleValue, "1");
    }
  }

  public async changeTeamOption(event: any) {
    const newSpecialRuleRaw = event.target.value;
    if (newSpecialRuleRaw.includes("|")) {
      const ruleBits = newSpecialRuleRaw.split("|");
      const ruleName = ruleBits[0];
      const ruleValue = ruleBits[1];
      await this.setSpecialRule(ruleName, ruleValue);
    }
  }

  private async setSpecialRule(ruleName: string, ruleValue: string) {
    const apiResponse = await this.fumbblApi.setSpecialRule(
      this.teamId,
      ruleName,
      ruleValue,
    );
    if (apiResponse.isSuccessful()) {
      this.triggerRulesUpdated();
      this.updateInProgress = true;
      this.showOneOfOptions = false;
      this.showTeamOptions = false;
    } else {
      this.errorModalInfo = {
        general: "An error occurred updating the teams special rule.",
        technical: apiResponse.getErrorMessage(),
      };
      this.showOneOfOptions = false;
      this.showTeamOptions = false;
    }
  }
}

export default toNative(SpecialRules2025Component);
</script>
