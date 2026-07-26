<template>
  <Modal
    class="modal-tier-config"
    :modal-size="'large'"
    :exclude-header="false"
    :exclude-buttons="true"
    @cancel="$emit('close')"
  >
    <template #header>Tier {{ headerTier }} Configuration</template>
    <template #body>
      <template v-if="tierConfig !== null">
        <table class="settings" width="100%">
          <tbody>
            <tr>
              <td width="25%">Starting Treasury</td>
              <td
                name="options.advancedTeamCreation.tierConfig.startingTreasury"
              >
                <ExpandingInput v-model="tierConfig.startingTreasury" />
              </td>
            </tr>
            <tr>
              <td>Skill Budget</td>
              <td name="options.advancedTeamCreation.tierConfig.skillBudget">
                <ExpandingInput v-model="tierConfig.skillBudget" />
              </td>
            </tr>
            <tr>
              <td>Flexible Funds</td>
              <td name="options.advancedTeamCreation.tierConfig.flexibleFunds">
                <ExpandingInput v-model="tierConfig.flexibleFunds" />
              </td>
            </tr>
            <tr>
              <td>Number of Star Players</td>
              <td
                name="options.advancedTeamCreation.tierConfig.starPlayerCount"
              >
                <ExpandingInput v-model="tierConfig.starPlayerCount" />
              </td>
            </tr>
            <tr>
              <td>Star Player skill cost</td>
              <td
                name="options.advancedTeamCreation.tierConfig.starPlayerSkillCost"
              >
                <ExpandingInput v-model="tierConfig.starPlayerSkillCost" />
              </td>
            </tr>
            <tr>
              <td>Mega-Stars counts as # stars</td>
              <td
                name="options.advancedTeamCreation.tierConfig.megaStarCountsAs"
              >
                <ExpandingInput v-model="tierConfig.megaStarCountsAs" />
              </td>
            </tr>
            <tr>
              <td>Mega-Star skill cost</td>
              <td
                name="options.advancedTeamCreation.tierConfig.megaStarSkillCost"
              >
                <ExpandingInput v-model="tierConfig.megaStarSkillCost" />
              </td>
            </tr>

            <tr>
              <td>Skill Package</td>
              <td name="options.advancedTeamCreation.tierConfig.skillPackage">
                <select v-model="tierConfig.skillPackage">
                  <option value="">(None)</option>
                  <option
                    v-for="(pkg, key) in availablePackages"
                    :key="key"
                    :value="key"
                  >
                    {{ pkg.name }}
                  </option>
                  <option
                    v-if="stalePackageRef"
                    :value="stalePackageRef"
                    disabled
                  >
                    (deleted: {{ stalePackageRef }})
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
  </Modal>
</template>

<style scoped>
@import "./tierconfigmodal.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Prop, Watch } from "vue-facing-decorator";
import { Modal } from "@components/fumbblcomponents";
import { useRulesetStore } from "../pinia/store";
import ExpandingInput from "./ExpandingInput.vue";

@Component({
  components: {
    Modal,
    ExpandingInput,
  },
})
class TierConfigModal extends Vue {
  public rulesetStore = useRulesetStore();

  @Prop({ type: Number, default: null })
  public tier!: number | null;

  public headerTier: number | null = null;

  get tierConfig(): any {
    if (this.tier === null) return null;
    if (
      !this.rulesetStore.rulesetData.options.advancedTeamCreation.tierConfig
    ) {
      this.rulesetStore.rulesetData.options.advancedTeamCreation.tierConfig =
        {};
    }
    if (
      !this.rulesetStore.rulesetData.options.advancedTeamCreation.tierConfig[
        this.tier
      ]
    ) {
      this.rulesetStore.rulesetData.options.advancedTeamCreation.tierConfig[
        this.tier
      ] = {
        tier: this.tier,
        startingTreasury: 0,
      };
    }
    return this.rulesetStore.rulesetData.options.advancedTeamCreation
      .tierConfig[this.tier];
  }

  get availablePackages(): Record<string, any> {
    return (
      this.rulesetStore.rulesetData.options.advancedTeamCreation
        ?.skillPackages || {}
    );
  }

  get stalePackageRef(): string | null {
    const ref = this.tierConfig?.skillPackage;
    if (ref && !this.availablePackages[ref]) {
      return ref;
    }
    return null;
  }

  @Watch("tier")
  onTierChanged(val: number | null) {
    if (val !== null) {
      this.headerTier = val;
    }
  }
}

export default toNative(TierConfigModal);
</script>
