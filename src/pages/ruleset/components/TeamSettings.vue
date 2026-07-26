<template>
  <div class="panel content" id="teamsettings" :key="rulesetStore.serial">
    <div class="col">
      <TitledPanel>
        <template #header>Team Creation</template>
        <template #content>
          <dl>
            <dt>Team Creation</dt>
            <dd name="options.teamSettings.startTreasury">
              <ExpandingInput
                v-model="
                  rulesetStore.rulesetData.options.teamSettings.startTreasury
                "
                :size="8"
              />
              Starting Treasury
            </dd>
          </dl>
        </template>
      </TitledPanel>

      <TitledPanel>
        <template #header>Team Limits</template>
        <template #content>
          <dl>
            <dt>Team Limits</dt>
            <dd>
              <span name="options.teamSettings.startPlayers">
                <select
                  v-model="
                    rulesetStore.rulesetData.options.teamSettings.startPlayers
                  "
                >
                  <option v-for="i in range(1, 16)" :value="i">
                    {{ i }}
                  </option>
                </select>
              </span>
              <span class="wide">to</span>
              <span name="options.teamSettings.maxPlayers">
                <select
                  v-model="
                    rulesetStore.rulesetData.options.teamSettings.maxPlayers
                  "
                >
                  <option v-for="i in range(1, 16)" :value="i">
                    {{ i }}
                  </option>
                </select>
              </span>
              players on team
            </dd>
            <dd>
              <Toggle
                name="options.rulesetOptions.tempRetiredTakesPositionSlot"
                v-model="
                  rulesetStore.rulesetData.options.rulesetOptions
                    .tempRetiredTakesPositionSlot
                "
              />
              Temporary retired players reserve a position slot
            </dd>
            <dd name="options.teamSettings.dedicatedFanCost">
              Fans cost
              <ExpandingInput
                v-model="
                  rulesetStore.rulesetData.options.teamSettings.dedicatedFanCost
                "
                :size="8"
              />
              gold each.
            </dd>
            <dd name="options.teamSettings.startFans">
              <select
                v-model="
                  rulesetStore.rulesetData.options.teamSettings.startFans
                "
              >
                <option v-for="i in range(0, 9)" :value="i">{{ i }}</option>
              </select>
              Starting Fans
            </dd>
            <dd>
              <span name="options.teamSettings.minStartFans">
                <select
                  v-model="
                    rulesetStore.rulesetData.options.teamSettings.minStartFans
                  "
                >
                  <option v-for="i in range(0, 9)" :value="i">
                    {{ i }}
                  </option>
                </select>
              </span>
              <span class="wide">to</span>
              <span name="options.teamSettings.maxStartFans">
                <select
                  v-model="
                    rulesetStore.rulesetData.options.teamSettings.maxStartFans
                  "
                >
                  <option v-for="i in range(0, 9)" :value="i">
                    {{ i }}
                  </option>
                </select>
              </span>
              fans on team
            </dd>
            <dd name="options.teamSettings.maxCheerleaders">
              <select
                v-model="
                  rulesetStore.rulesetData.options.teamSettings.maxCheerleaders
                "
              >
                <option v-for="i in range(0, 16)" :value="i">
                  {{ i }}
                </option>
              </select>
              Max Cheerleaders
            </dd>
          </dl>
        </template>
      </TitledPanel>
      <TitledPanel>
        <template #header>Progression</template>
        <template #content>
          <dl>
            <dt>Progression</dt>
            <dd name="options.teamSettings.teamProgression">
              <select
                v-model="
                  rulesetStore.rulesetData.options.teamSettings.teamProgression
                "
              >
                <option value="standard">Standard</option>
                <option value="none">No Progression</option>
              </select>
              Team Progression
            </dd>
            <dd name="options.teamSettings.skillProgressionType">
              <select
                id="progressionselect"
                v-model="
                  rulesetStore.rulesetData.options.teamSettings
                    .skillProgressionType
                "
              >
                <option value="standard">BB2016</option>
                <option value="bb2020">BB2020</option>
                <option value="bb2025">BB2025</option>
                <option value="none">None</option>
                <option value="custom-spp">Custom SPP limits</option>
                <option value="predetermined">Predetermined</option>
              </select>
              Skill Progression
              <div id="ProgressionDescription"></div>
            </dd>
            <dd
              id="customspp"
              name="options.teamSettings.sppLimits"
              v-if="
                rulesetStore.rulesetData.options.teamSettings
                  .skillProgressionType === 'custom-spp'
              "
            >
              Custom SPPs per skill:
              <ExpandingInput
                v-model="
                  rulesetStore.rulesetData.options.teamSettings.sppLimits
                "
              />
              SPPs required for skills, comma separated.
            </dd>
            <dd
              id="predeterminedSkills"
              name="options.teamSettings.predeterminedSkills"
              v-if="
                rulesetStore.rulesetData.options.teamSettings
                  .skillProgressionType === 'predetermined'
              "
            >
              Skill definitions:
              <ExpandingInput
                v-model="
                  rulesetStore.rulesetData.options.teamSettings
                    .predeterminedSkills
                "
              />
              Comma separated list of game/skill type pairs.
            </dd>
            <dd
              id="skillsPerPlayer"
              name="options.teamSettings.skillsPerPlayer"
              v-if="
                rulesetStore.rulesetData.options.teamSettings
                  .skillProgressionType === 'predetermined'
              "
            >
              <ExpandingInput
                v-model="
                  rulesetStore.rulesetData.options.teamSettings.skillsPerPlayer
                "
                :size="3"
              />
              Skills per Player
            </dd>
          </dl>
        </template>
      </TitledPanel>
    </div>
  </div>
</template>

<style scoped>
@import "./teamsettings.less";
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
class TeamSettings extends Vue {
  public rulesetStore = useRulesetStore();

  public range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
  }
}

export default toNative(TeamSettings);
</script>
