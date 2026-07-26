<template>
  <div class="panel content" id="tiers" :key="rulesetStore.serial">
    <div class="col">
      <TitledPanel>
        <template #header>Tiers</template>
        <template #content>
          <drop
            v-if="tierAbove >= 0 && rulesetStore.isEditable"
            _tag="tier"
            :drag-image-opacity="1"
            class="tierwrap new-tier"
            mode="move"
            @drop="(event: any) => drop(event, tierAbove)"
          >
            <div class="tier new">New Tier ({{ tierAbove }})</div>
          </drop>

          <template v-for="tier in displayTiers" :key="tier">
            <drop
              _tag="tier"
              :drag-image-opacity="1"
              :class="[
                'tierwrap',
                { empty: rulesetStore.tierData[tier].rosters.length === 0 },
              ]"
              mode="move"
              @drop="(event: any) => drop(event, tier)"
            >
              <div class="tier-header">
                <div>
                  <div
                    :class="[
                      'tier',
                      {
                        empty: rulesetStore.tierData[tier].rosters.length === 0,
                      },
                    ]"
                  >
                    Tier {{ tier }}
                  </div>
                  <span class="tier-detail">{{ tierSummary(tier) }}</span>
                </div>
                <a
                  v-if="isAdvancedTeamCreation"
                  class="btn-configure"
                  href="#"
                  @click.prevent="showTierConfig(tier)"
                  >Configure</a
                >
              </div>
              <drag
                v-for="rosterId in rulesetStore.tierData[tier].rosters"
                :key="rosterId"
                :data="rulesetStore.rosterCache[rosterId]"
                :disabled="!rulesetStore.isEditable"
                :class="['roster', { draggable: rulesetStore.isEditable }]"
              >
                <img :src="getRosterLogo(rosterId)" class="roster-logo" />
                <span class="roster-name">{{
                  rulesetStore.rosterCache[rosterId].value
                }}</span>
              </drag>
            </drop>
          </template>

          <drop
            v-if="rulesetStore.isEditable"
            _tag="tier"
            :drag-image-opacity="1"
            class="tierwrap new-tier"
            mode="move"
            @drop="(event: any) => drop(event, tierBelow)"
          >
            <div class="tier new">New Tier ({{ tierBelow }})</div>
          </drop>
        </template>
      </TitledPanel>
    </div>

    <TierConfigModal
      v-show="configuringTier !== null"
      :tier="configuringTier"
      @close="configuringTier = null"
    />
  </div>
</template>

<style scoped>
@import "./tiers.less";
</style>

<script lang="ts">
import { Component, Vue, toNative } from "vue-facing-decorator";
import { useRulesetStore } from "../pinia/store";
import { TitledPanel } from "@components/fumbblcomponents";
import TierConfigModal from "./TierConfigModal.vue";
import { Drag, Drop } from "vue-easy-dnd";

@Component({
  components: {
    TitledPanel,
    TierConfigModal,
    drag: Drag,
    drop: Drop,
  },
})
class Tiers extends Vue {
  public rulesetStore = useRulesetStore();

  public configuringTier: number | null = null;

  get sortedTiers(): number[] {
    return Object.keys(this.rulesetStore.tierData)
      .map(Number)
      .sort((a, b) => a - b);
  }

  get displayTiers(): number[] {
    if (this.rulesetStore.isEditable) return this.sortedTiers;
    return this.sortedTiers.filter(
      (t) => this.rulesetStore.tierData[t].rosters.length > 0,
    );
  }

  get tierAbove(): number {
    const tiers = this.sortedTiers;
    if (tiers.length === 0) return -1;
    const min = tiers[0];
    return min - 1 >= 0 ? min - 1 : -1;
  }

  get tierBelow(): number {
    const tiers = this.sortedTiers;
    return tiers.length > 0 ? tiers[tiers.length - 1] + 1 : 1;
  }

  get isAdvancedTeamCreation(): boolean {
    return (
      this.rulesetStore.rulesetData.options?.advancedTeamCreation?.enabled ===
      true
    );
  }

  public getRosterLogo(rosterId: number): string {
    const roster = this.rulesetStore.rosterCache[rosterId];
    const logoId = roster?.logo?.["32"];
    return `https://fumbbl.com/i/${logoId && logoId !== 0 ? logoId : 486370}`;
  }

  public drop(event: any, newTier: number) {
    const rosterId = event.data.id;
    if (rosterId) {
      this.rulesetStore.setRosterTier(rosterId, newTier);
    }
  }

  public showTierConfig(tier: number) {
    this.configuringTier = tier;
  }

  public tierSummary(tier: number): string {
    const config =
      this.rulesetStore.rulesetData.options.advancedTeamCreation?.tierConfig?.[
        tier
      ];
    if (!config) return "";

    const fmt = (v: any): string => {
      const n = Number(v);
      if (isNaN(n)) return String(v);
      if (n >= 1000) return (n / 1000).toFixed(n % 1000 ? 1 : 0) + "k";
      return String(n);
    };

    const parts: string[] = [];
    if (config.startingTreasury)
      parts.push(fmt(config.startingTreasury) + " treasury");
    if (config.skillBudget) parts.push(fmt(config.skillBudget) + " skills");
    if (config.flexibleFunds)
      parts.push(fmt(config.flexibleFunds) + " flexible");

    if (config.skillPackage) {
      const pkg =
        this.rulesetStore.rulesetData.options.advancedTeamCreation
          ?.skillPackages?.[config.skillPackage];
      if (pkg) parts.push("pkg: " + pkg.name);
    }

    return parts.length > 0 ? parts.join(" | ") : "";
  }
}

export default toNative(Tiers);
</script>
