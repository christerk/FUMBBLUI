<template>
  <div class="panel content" id="seasons" :key="rulesetStore.serial">
    <div class="col">
      <TitledPanel>
        <template #header>Seasons</template>
        <template #content>
          <dl>
            <dt>Core settings</dt>
            <dd>
              <Toggle
                name="options.rulesetOptions.seasons"
                v-model="rulesetStore.rulesetData.options.rulesetOptions.seasons"
              />
              Enable Seasons.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonLength"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonLength" :size="3" />
              games per season.
            </dd>
            <dt>Season Mechanics</dt>
            <dd>
              <Toggle
                name="options.rulesetOptions.redraftInjuryRollsBeforeHire"
                v-model="rulesetStore.rulesetData.options.rulesetOptions.redraftInjuryRollsBeforeHire"
              />
              Roll for injuries before the hire/fire phase.
            </dd>
            <dd>
              <Toggle
                name="options.rulesetOptions.redraftStatsTurnIntoNiggles"
                v-model="rulesetStore.rulesetData.options.rulesetOptions.redraftStatsTurnIntoNiggles"
              />
              Healed stat injuries on temporarily retired players turn into
              niggling injuries.
            </dd>

            <dt>Re-Drafting Budget</dt>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonGoldBase"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonGoldBase" :size="3" />
              k gold base budget.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonGoldPerGame"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonGoldPerGame" :size="3" />
              k gold per game.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonGoldPerWin"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonGoldPerWin" :size="3" />
              k gold per win.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonGoldPerTie"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonGoldPerTie" :size="3" />
              k gold per tie.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonGoldPerLoss"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonGoldPerLoss" :size="3" />
              k gold per loss.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonRedraftRamp"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonRedraftRamp" :size="3" />
              k Re-draft ramp. 0 to disable.
            </dd>
            <dd
              style="padding-left: 50px; font-style: oblique; font-size: 11px"
            >
              The Re-draft Ramp setting will limit the cap for the first few
              (total) games played for a team to Base + CapRamp * NumGames.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonCap"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonCap" :size="3" />
              k Cap. 0 to disable.
            </dd>

            <dt>Re-Hiring</dt>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonAgentFeeBase"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonAgentFeeBase" :size="3" />
              k baseline agent fee.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonAgentFeePerSeason"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonAgentFeePerSeason" :size="3" />
              k cumulative gold per season agent fee.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.seasonAgentFeeSeasonModifier"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.seasonAgentFeeSeasonModifier" :size="3" />
              zero cumulative fee seasons.
            </dd>
            <dd
              style="padding-left: 50px; font-style: oblique; font-size: 11px"
            >
              The zero cumulative fee seasons setting is the number of seasons
              before the cumulative fee kicks in. 2 will make the first two
              seasons only add the baseline, and only start adding the
              cumulative fee starting after the third season.
            </dd>
          </dl>
        </template>
      </TitledPanel>
    </div>
  </div>
</template>

<style scoped>
@import "./seasons.less";
</style>

<script lang="ts">
import { Component, Vue, toNative } from "vue-facing-decorator";
import { useRulesetStore } from "../pinia/store";
import { TitledPanel, Toggle } from "@components/fumbblcomponents";
import ExpandingInput from "./ExpandingInput.vue";

@Component({
  components: {
    TitledPanel,
    Toggle,
    ExpandingInput,
  },
})
class Seasons extends Vue {
  public rulesetStore = useRulesetStore();
}

export default toNative(Seasons);
</script>
