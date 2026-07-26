<template>
  <div class="panel content" id="mechanics" :key="rulesetStore.serial">
    <div class="col">
      <TitledPanel>
        <template #header>Mechanics</template>
        <template #content>
          <dl>
            <dt>Setup</dt>
            <dd name="options.clientOptions.wideZonePlayers">
              A maximum of
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.wideZonePlayers" :size="2" />
              players may be set up in each widezone.
            </dd>
            <dd name="options.clientOptions.playersOnField">
              A maximum of
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.playersOnField" :size="2" />
              players may be set up on the field.
            </dd>
            <dd name="options.clientOptions.playersOnLos">
              A minimum of
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.playersOnLos" :size="2" />
              players must be set up on the line of scrimmage.
            </dd>
            <dt>Gameplay</dt>
            <dd>
              <Toggle
                name="options.clientOptions.allowConcessions"
                v-model="rulesetStore.rulesetData.options.clientOptions.allowConcessions"
              />
              Allow Concessions.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.timeoutAllowed"
                v-model="rulesetStore.rulesetData.options.clientOptions.timeoutAllowed"
              />
              Allow Timeouts.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.argueTheCall"
                v-model="rulesetStore.rulesetData.options.clientOptions.argueTheCall"
              />
              Enable Argue the Call rule.
            </dd>
            <dd v-if="rulesetStore.isVersion('2025')">
              <Toggle
                name="options.clientOptions.allowSpecialActionsFromProne"
                v-model="rulesetStore.rulesetData.options.clientOptions.allowSpecialActionsFromProne"
              />
              Allow special actions to be declared while prone.
            </dd>
            <dd v-if="rulesetStore.isVersion('2025')">
              <Toggle
                name="options.clientOptions.enableGettingEven"
                v-model="rulesetStore.rulesetData.options.clientOptions.enableGettingEven"
              />
              Enable Getting Even (Hatred) rule.
            </dd>
            <dd name="options.clientOptions.fouling">
              Fouling is
              <select v-model="rulesetStore.rulesetData.options.clientOptions.fouling">
                <option value="unmodified">unmodified</option>
                <option value="armour">done with +1 to the armour roll</option>
                <option value="outsidetz">with +1 to injury if not interfered</option>
              </select>
              .
            </dd>
            <dt>Extras</dt>
            <dd>
              <Toggle
                name="options.clientOptions.spikedBall"
                v-model="rulesetStore.rulesetData.options.clientOptions.spikedBall"
              />
              A spiked ball is used for play. Any failed pickup or catch roll
              results in the player being stabbed.
            </dd>

            <dt>Overtime</dt>
            <dd>
              <Toggle
                name="options.clientOptions.overtime"
                v-model="rulesetStore.rulesetData.options.clientOptions.overtime"
              />
              Enable overtime.
            </dd>
            <dd name="options.clientOptions.overtimeGoldenGoal">
              <Toggle
                name="options.clientOptions.overtimeGoldenGoal"
                v-model="rulesetStore.rulesetData.options.clientOptions.overtimeGoldenGoal"
              />
              Use Golden Goal for overtime.
            </dd>
            <dd name="options.clientOptions.overtimeKickOffResults">
              Use
              <select
                v-model="rulesetStore.rulesetData.options.clientOptions.overtimeKickOffResults"
              >
                <option value="all">all</option>
                <option value="blitz">blitz</option>
                <option value="solidDefence">solid defence</option>
                <option value="blitzOrSolidDefence">blitz or solid defence (choice)</option>
                <option value="randomBlitzOrSolidDefence">blitz or solid defence (random)</option>
              </select>
              kickoff results for overtime.
            </dd>
            <dt>MVPs</dt>
            <dd name="options.clientOptions.mvpNominations">
              Nominate
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.mvpNominations" :size="2" />
              players for MVP selection. Use 0 for random selection.
            </dd>

            <dt>Post-Game</dt>
            <dd>
              <Toggle
                name="options.rulesetOptions.spirallingExpenses"
                v-model="rulesetStore.rulesetData.options.rulesetOptions.spirallingExpenses"
              />
              Enable Spiralling Expenses.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.spirallingBase"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.spirallingBase" :size="3" />
              k TV start point.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.spirallingStep"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.spirallingStep" :size="3" />
              k TV step for increased expenses.
            </dd>
            <dd
              style="padding-left: 25px; font-style: oblique; font-size: 11px"
            >
              Note that spiralling expenses interact with petty cash
              transferred. Take care with the BB2016 inducement option to
              transfer all gold to petty cash.
            </dd>
            <dd>
              <Toggle
                name="options.rulesetOptions.expensiveMistakes"
                v-model="rulesetStore.rulesetData.options.rulesetOptions.expensiveMistakes"
              />
              Enable Expensive Mistakes.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.expensiveMistakesBase"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.expensiveMistakesBase" :size="1" />
              Base roll.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.expensiveMistakesStart"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.expensiveMistakesStart" :size="3" />
              k gold start point.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.expensiveMistakesStep"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.expensiveMistakesStep" :size="3" />
              k gold step for tiers.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.expensiveMistakesMax"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.expensiveMistakesMax" :size="3" />
              tier steps.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.expensiveMistakesMinors"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.expensiveMistakesMinors" :size="3" />
              minor incidents.
            </dd>
            <dd
              style="padding-left: 25px"
              name="options.rulesetOptions.expensiveMistakesMajors"
            >
              <ExpandingInput v-model="rulesetStore.rulesetData.options.rulesetOptions.expensiveMistakesMajors" :size="3" />
              major incidents.
            </dd>
            <dd
              style="padding-left: 25px; font-style: oblique; font-size: 11px"
            >
              Base - D6 + Min(MaxSteps, Floor((Treasury-Start) / StepSize))<br />
              1-5: Crisis Averted, <span id="emminorrange">6-7</span>: Minor
              incident, <span id="emmajorrange">8</span>: Major Incident,
              <span id="emcatrange">9+</span>: Catastrophe
            </dd>
          </dl>
        </template>
      </TitledPanel>
      <TitledPanel>
        <template #header>Visual Assists</template>
        <template #content>
          <dl>
            <dt>Tacklezones</dt>
            <dd>
              <Toggle
                name="options.clientOptions.enableTacklezoneOverlays"
                v-model="rulesetStore.rulesetData.options.clientOptions.enableTacklezoneOverlays"
              />
              Allow tackle zone overlays.
            </dd>
          </dl>
        </template>
      </TitledPanel>
    </div>
  </div>
</template>

<style scoped>
@import "./mechanics.less";
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
class Mechanics extends Vue {
  public rulesetStore = useRulesetStore();
}

export default toNative(Mechanics);
</script>
