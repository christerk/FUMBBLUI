<template>
  <div
    class="panel content"
    id="advancedteamcreation"
    :key="rulesetStore.serial"
  >
    <div class="col">
      <TitledPanel>
        <template #header>Advanced Team Creation</template>
        <template #content>
          <dl>
            <dt>Advanced Team Creation</dt>
            <dd>
              <Toggle
                name="options.advancedTeamCreation.enabled"
                v-model="
                  rulesetStore.rulesetData.options.advancedTeamCreation.enabled
                "
              />
              Enable advanced team creation. See <em>Tiers</em> section.
            </dd>
            <dd>
              <Toggle
                name="options.advancedTeamCreation.starPlayersCountAsPlayers"
                v-model="
                  rulesetStore.rulesetData.options.advancedTeamCreation
                    .starPlayersCountAsPlayers
                "
              />
              Star Players count as starting team.
            </dd>
            <dt>Skill Purchasing</dt>
            <dd name="options.advancedTeamCreation.skillCostType">
              Skills cost
              <select
                id="skillcostselect"
                v-model="
                  rulesetStore.rulesetData.options.advancedTeamCreation
                    .skillCostType
                "
              >
                <option value="spp">SPP</option>
                <option value="gold">Gold</option>
              </select>
            </dd>
            <dd name="options.advancedTeamCreation.eliteSkillTax">
              Elite skills cost an extra
              <ExpandingInput
                v-model="
                  rulesetStore.rulesetData.options.advancedTeamCreation
                    .eliteSkillTax
                "
              />
              {{
                rulesetStore.rulesetData.options.advancedTeamCreation
                  .skillCostType
              }}
            </dd>
          </dl>

          <div class="skill-packages-section">
            <dl><dt>Skill Packages</dt></dl>

            <div
              v-for="(pkg, name) in packages"
              :key="name"
              class="skill-package-item"
            >
              <div class="skill-package-info">
                <strong>{{ pkg.name }}</strong>
                <span class="pkg-detail">{{ allowanceSummary(pkg) }}</span>
              </div>
              <div class="skill-package-actions">
                <button @click="editPackage(name)">Edit</button>
                <button class="btn-delete" @click="deletePackage(name)">
                  Delete
                </button>
              </div>
            </div>

            <div v-if="packageKeys.length === 0" class="empty-hint">
              No skill packages defined yet.
            </div>

            <button @click="addPackage" class="btn-add-package">
              Add Skill Package
            </button>
          </div>
        </template>
      </TitledPanel>
    </div>

    <SkillPackageModal
      v-if="editingPackage !== null"
      :package-name="editingPackage"
      @close="editingPackage = null"
      @saved="onPackageSaved"
    />

    <Modal
      class="modal-confirm-package"
      v-show="confirmingPackageKey !== null"
      :modal-size="'small'"
      :exclude-header="false"
      :exclude-buttons="false"
      @cancel="confirmingPackageKey = null"
      @confirm="confirmDeletePackage()"
    >
      <template #header>Remove Skill Package?</template>
      <template #body>
        <div class="pad">
          Are you sure you want to delete the
          <strong>'{{ confirmingPackageName }}'</strong> skill package?
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
@import "./advancedteamcreation.less";
</style>

<script lang="ts">
import { Component, Vue, toNative } from "vue-facing-decorator";
import { useRulesetStore } from "../pinia/store";
import { TitledPanel, Toggle, Modal } from "@components/fumbblcomponents";
import ExpandingInput from "./ExpandingInput.vue";
import SkillPackageModal from "./SkillPackageModal.vue";

@Component({
  components: {
    TitledPanel,
    Toggle,
    Modal,
    ExpandingInput,
    SkillPackageModal,
  },
})
class AdvancedTeamCreation extends Vue {
  public rulesetStore = useRulesetStore();
  public editingPackage: string | null = null;

  get packages(): Record<string, any> {
    return (
      this.rulesetStore.rulesetData.options.advancedTeamCreation
        .skillPackages || {}
    );
  }

  get packageKeys(): string[] {
    return Object.keys(this.packages);
  }

  addPackage() {
    const atc = this.rulesetStore.rulesetData.options.advancedTeamCreation;
    if (!atc.skillPackages) {
      atc.skillPackages = {};
    }
    const key = "new-package";
    let idx = 1;
    let uniqueKey = key;
    while (atc.skillPackages[uniqueKey]) {
      uniqueKey = `${key}-${idx++}`;
    }
    this.editingPackage = uniqueKey;
  }

  editPackage(name: string) {
    this.editingPackage = name;
  }

  public confirmingPackageKey: string | null = null;
  public confirmingPackageName: string = "";

  deletePackage(name: string) {
    const pkg = this.packages[name];
    if (!pkg) return;
    this.confirmingPackageName = pkg.name || name;
    this.confirmingPackageKey = name;
  }

  confirmDeletePackage() {
    const key = this.confirmingPackageKey;
    if (!key) return;
    this.confirmingPackageKey = null;

    const packages =
      this.rulesetStore.rulesetData.options.advancedTeamCreation.skillPackages;
    if (!packages) return;
    delete packages[key];

    const tierConfig = this.rulesetStore.rulesetData.options.advancedTeamCreation.tierConfig;
    if (tierConfig) {
      for (const tier of Object.keys(tierConfig)) {
        if (tierConfig[tier].skillPackage === key) {
          delete tierConfig[tier].skillPackage;
        }
      }
    }
  }

  allowanceSummary(pkg: any): string {
    const parts = (pkg.allowances || []).map((a: any) => {
      const players =
        a.maxPlayers === 0
          ? "unlimited"
          : a.maxPlayers === 1
            ? "1 player"
            : a.maxPlayers + " players";
      return a.label + " (" + players + ")";
    });
    return parts.length > 0 ? parts.join(" | ") : "0 allowances";
  }

  onPackageSaved(newName: string) {
    this.editingPackage = null;
  }
}

export default toNative(AdvancedTeamCreation);
</script>
