<template>
  <div class="panel content" id="skillsettings" :key="rulesetStore.serial">
    <div :class="rulesetStore.categories.length == 5 ? 'cols5' : 'cols3'">
      <template v-for="category in rulesetStore.categories">
        <TitledPanel v-if="category.allowconfig">
          <template #header>{{ category.name }}</template>
          <template #content>
            <template v-for="skill in rulesetStore.skills">
              <div
                class="skill"
                v-if="skill.option && skill.category == category.code"
                :name="'options.skillOptions.' + skill.option"
              >
                <Toggle
                  :id="'rulesetStore.rulesetData.options.skillOptions.' + skill.option"
                  v-model="rulesetStore.rulesetData.options.skillOptions[skill.option]"
                />
                <label
                  :for="'rulesetStore.rulesetData.options.skillOptions.' + skill.option"
                >{{ skill.name }}</label>
              </div>
            </template>
          </template>
        </TitledPanel>
      </template>
    </div>
    <TitledPanel>
      <template #header>Skill Settings</template>
      <template #content>
        <dl>
          <dt>Animal Savagery</dt>
          <dd>
            <Toggle
              name="options.clientOptions.animalSavageryLashOutEndsActivation"
              v-model="rulesetStore.rulesetData.options.clientOptions.animalSavageryLashOutEndsActivation"
            />
            Animal Savagery lash-out ends activation.
          </dd>
          <dt>Ball &amp; Chain</dt>
          <dd>
            <Toggle
              name="options.clientOptions.allowBallAndChainReRoll"
              v-model="rulesetStore.rulesetData.options.clientOptions.allowBallAndChainReRoll"
            />
            Ball &amp; Chain may use team re-rolls and pro to re-roll direction rolls.
          </dd>
          <dd>
            <Toggle
              name="options.clientOptions.allowSpecialBlocksWithBallAndChain"
              v-model="rulesetStore.rulesetData.options.clientOptions.allowSpecialBlocksWithBallAndChain"
            />
            Ball &amp; Chain may use Chainsaw, Stab, or Vomit instead of a regular block.
          </dd>
          <dt>Bombardier</dt>
          <dd>
            <Toggle
              name="options.clientOptions.bomberPlacedProneIgnoresTurnover"
              v-model="rulesetStore.rulesetData.options.clientOptions.bomberPlacedProneIgnoresTurnover"
            />
            Bomber placed prone is not a turnover.
          </dd>
          <dd>
            <Toggle
              name="options.clientOptions.bombUsesMb"
              v-model="rulesetStore.rulesetData.options.clientOptions.bombUsesMb"
            />
            Bomb hits with mighty blow.
          </dd>
          <dd v-if="rulesetStore.isVersion('2025')">
            <Toggle
              name="options.clientOptions.bombBouncesOnEmptySquares"
              v-model="rulesetStore.rulesetData.options.clientOptions.bombBouncesOnEmptySquares"
            />
            Bomb bouces on empty squares.
          </dd>

          <dt v-if="rulesetStore.isVersion('2020', '2025')">Brawler</dt>
          <dd v-if="rulesetStore.isVersion('2020', '2025')">
            <Toggle
              name="options.clientOptions.allowBrawlerOnBothBlocks"
              v-model="rulesetStore.rulesetData.options.clientOptions.allowBrawlerOnBothBlocks"
            />
            Brawler can be used once per block during a turn.
          </dd>
          <dt>Chainsaw</dt>
          Chainsaw causes turnover on
          <span name="options.clientOptions.chainsawTurnover">
            <select v-model="rulesetStore.rulesetData.options.clientOptions.chainsawTurnover">
              <option value="never">never</option>
              <option value="kickback">kickback</option>
              <option value="kickbackAvBreak">kickback AV break</option>
              <option value="allAvBreaks">all AV breaks</option>
            </select>
          </span>
          armour breaks.
          <dt>Claw</dt>
          <dd>
            <Toggle
              name="options.clientOptions.clawNoStack"
              v-model="rulesetStore.rulesetData.options.clientOptions.clawNoStack"
            />
            Claw does not stack with other skills that modify armour rolls.
          </dd>
          <dt>Diving Tackle</dt>
          <dd>
            <Toggle
              name="options.clientOptions.divingTackleLeavingTzOnly"
              v-model="rulesetStore.rulesetData.options.clientOptions.divingTackleLeavingTzOnly"
            />
            Only allow diving tackle when leaving Tackle Zone.
          </dd>
          <dt>Kick</dt>
          <dd>
            <Toggle
              name="options.clientOptions.askForKickAfterRoll"
              v-model="rulesetStore.rulesetData.options.clientOptions.askForKickAfterRoll"
            />
            Ask for kick use after roll.
          </dd>
          <dt>Mighty Blow</dt>
          <dd>
            <Toggle
              name="options.clientOptions.mbStacksAgainstChainsaw"
              v-model="rulesetStore.rulesetData.options.clientOptions.mbStacksAgainstChainsaw"
            />
            Mighty Blow stacks against Chainsaw.
          </dd>
          <dt>Piling On</dt>
          <dd name="options.clientOptions.pilingOn">
            Allow coach to reroll
            <select v-model="rulesetStore.rulesetData.options.clientOptions.pilingOn">
              <option value="both">both</option>
              <option value="armour">armour</option>
              <option value="injury">injury</option>
            </select>
            rolls.
          </dd>
          <dd>
            <Toggle
              name="options.clientOptions.pilingOnNoStack"
              v-model="rulesetStore.rulesetData.options.clientOptions.pilingOnNoStack"
            />
            Piling On does not stack with other skills that modify armour or injury rolls.
          </dd>
          <dd name="options.clientOptions.pilingOnKoDouble">
            <input
              v-model="rulesetStore.rulesetData.options.clientOptions.pilingOnKoDouble"
              type="checkbox"
            />
            Piling On player is knocked out when rolling a double on armour or injury rolls.
          </dd>
          <dd>
            <Toggle
              name="options.clientOptions.pilingOnUsesATeamReroll"
              v-model="rulesetStore.rulesetData.options.clientOptions.pilingOnUsesATeamReroll"
            />
            Piling On requires a Team Reroll.
          </dd>
          <dt>Right Stuff</dt>
          <dd>
            <Toggle
              name="options.clientOptions.rightStuffCancelTackle"
              v-model="rulesetStore.rulesetData.options.clientOptions.rightStuffCancelTackle"
            />
            Right Stuff prevents Tackle skill when blocked.
          </dd>
          <dt>Throw Team-mate</dt>
          <dd>
            <Toggle
              name="options.clientOptions.endTurnWhenHittingAnyPlayerWithTtm"
              v-model="rulesetStore.rulesetData.options.clientOptions.endTurnWhenHittingAnyPlayerWithTtm"
            />
            Cause a turnover if an opponent player is hit by a thrown team-mate.
          </dd>
          <dd style="padding-left: 25px; font-style: oblique; font-size: 11px">
            Hitting team-mates always causes a turnover.
          </dd>
          <dt>Sneaky Git</dt>
          <dd>
            <Toggle
              name="options.clientOptions.sneakyAsFoul"
              v-model="rulesetStore.rulesetData.options.clientOptions.sneakyAsFoul"
            />
            Sneaky Git functions as Guard on foul assists.
          </dd>
          <dd>
            <Toggle
              name="options.clientOptions.sneakyBanToKo"
              v-model="rulesetStore.rulesetData.options.clientOptions.sneakyBanToKo"
            />
            Banned Sneaky Git players are sent to the KO box instead.
          </dd>
          <dd>
            <Toggle
              name="options.clientOptions.sneakyGitCanMoveAfterFoul"
              v-model="rulesetStore.rulesetData.options.clientOptions.sneakyGitCanMoveAfterFoul"
            />
            Sneaky Git can move after fouling.
          </dd>
          <dt>Stand Firm</dt>
          <dd>
            <Toggle
              name="options.clientOptions.standFirmNoFall"
              v-model="rulesetStore.rulesetData.options.clientOptions.standFirmNoFall"
            />
            Failing to dodge ends the player's turn instead of falling over. Does not cause a turnover.
          </dd>
          <dt>Swoop</dt>
          <dd name="options.clientOptions.swoopDistance">
            Swoop distance:
            <input v-model="rulesetStore.rulesetData.options.clientOptions.swoopDistance" type="text" size="2" />
          </dd>
          <dd style="padding-left: 25px; font-style: oblique; font-size: 11px">
            Setting to zero makes the swoop distance D3 as per BB2020 rules.
          </dd>
        </dl>
      </template>
    </TitledPanel>

    <TitledPanel v-if="rulesetStore.isVersion('2020')">
      <template #header>Options</template>
      <template #content>
        <dl>
          <dt>Plague Ridden</dt>
          <dd>
            Raised position
            <div id="plagueRiddenControlPanel">
              <span name="options.rulesetOptions.plagueRiddenRoster">
                <select
                  v-model="rulesetStore.rulesetData.options.rulesetOptions.plagueRiddenRoster"
                  id="plagueRiddenRosterSelect"
                >
                  <option value="0">Select Roster</option>
                </select>
              </span>
              <span name="options.rulesetOptions.plagueRiddenPosition">
                <select
                  v-model="rulesetStore.rulesetData.options.rulesetOptions.plagueRiddenPosition"
                  id="plagueRiddenPositionSelect"
                >
                  <option value="0">Select Position</option>
                </select>
              </span>
            </div>
          </dd>
        </dl>
      </template>
    </TitledPanel>
  </div>
</template>

<style scoped>
@import "./skillsettings.less";
</style>

<script lang="ts">
import { Component, Vue, toNative } from "vue-facing-decorator";
import { useRulesetStore } from "../pinia/store";
import { TitledPanel, Toggle } from "@components/fumbblcomponents";

@Component({
  components: {
    TitledPanel,
    Toggle,
  },
})
class SkillSettings extends Vue {
  public rulesetStore = useRulesetStore();
}

export default toNative(SkillSettings);
</script>
