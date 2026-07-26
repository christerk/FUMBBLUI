<template>
  <div>
    <Modal
      class="modal-skill-package"
      ref="modalInstance"
      :modal-size="'large'"
      :button-settings="buttonSettings"
      @cancel="$emit('close')"
      @confirm="save"
    >
      <template #header>Edit Skill Package</template>
      <template #body>
        <table class="settings" width="100%">
          <tbody>
            <tr>
              <td width="25%">Package Name</td>
              <td>
                <input v-model="localName" type="text" placeholder="Package Name" ref="nameInput" />
              </td>
            </tr>
          </tbody>
        </table>

        <h4 class="allowances-header">Allowances</h4>

        <div
          v-for="(allowance, aIndex) in localAllowances"
          :key="aIndex"
          class="allowance-card"
        >
          <table class="settings" width="100%">
            <tbody>
              <tr>
                <td width="25%">Label</td>
                <td>
                  <input v-model="allowance.label" type="text" />
                </td>
              </tr>
              <tr>
                <td>Max Players</td>
                <td>
                  <input
                    v-model.number="allowance.maxPlayers"
                    type="number"
                    min="0"
                  />
                  <span class="hint">(0 = unlimited)</span>
                </td>
              </tr>
              <tr>
                <td>Max Skills / Player</td>
                <td>
                  <input
                    v-model.number="allowance.maxSkillsPerPlayer"
                    type="number"
                    min="1"
                    @change="onMaxSkillsChanged(aIndex)"
                  />
                </td>
              </tr>
              <tr>
                <td>Skill Types</td>
                <td class="skill-types-cell">
                  <label>
                    <input
                      type="checkbox"
                      value="primary"
                      v-model="allowance.allowedSkillTypes"
                    />
                    Primary
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="secondary"
                      v-model="allowance.allowedSkillTypes"
                    />
                    Secondary
                  </label>
                  <span class="hint"
                    >Elite skill cost is set via the global Elite Skill Tax
                    above.</span
                  >
                </td>
              </tr>
            </tbody>
          </table>

          <div class="cost-matrix-wrap">
            <table class="cost-matrix">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="st in allowance.allowedSkillTypes" :key="st">
                    {{ st }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="slotIndex in allowance.maxSkillsPerPlayer"
                  :key="slotIndex - 1"
                >
                  <td class="slot-label">{{ ordinal(slotIndex) }}</td>
                  <td v-for="st in allowance.allowedSkillTypes" :key="st">
                    <ExpandingInput
                      class="cost-cell"
                      :model-value="getCost(aIndex, slotIndex - 1, st)"
                      @update:model-value="setCost(aIndex, slotIndex - 1, st, $event)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            class="btn-remove-allowance"
            @click="confirmRemoveAllowance(aIndex)"
          >
            Remove Allowance
          </button>
        </div>

        <div class="add-allowance-wrap">
          <button @click="addAllowance">+ Add Allowance</button>
        </div>
      </template>
    </Modal>

    <Modal
      class="modal-confirm-allowance"
      v-show="confirmingAllowanceIndex !== null"
      :modal-size="'small'"
      :exclude-header="false"
      :exclude-buttons="false"
      @cancel="confirmingAllowanceIndex = null"
      @confirm="removeAllowance()"
    >
      <template #header>Remove Allowance?</template>
      <template #body>
        <div class="pad">
          Are you sure you want to remove the
          <strong>'{{ confirmingAllowanceLabel }}'</strong> allowance?
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
@import "./skillpackagemodal.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Prop, Ref, Emit } from "vue-facing-decorator";
import { Modal } from "@components/fumbblcomponents";
import ExpandingInput from "./ExpandingInput.vue";
import { useRulesetStore } from "../pinia/store";

@Component({
  components: { Modal, ExpandingInput },
})
class SkillPackageModal extends Vue {
  public rulesetStore = useRulesetStore();

  @Prop({ type: String, required: true })
  public packageName!: string;

  @Ref
  public modalInstance!: any;

  @Ref
  public nameInput!: HTMLInputElement;

  public get buttonSettings() {
    return {
      cancel: { enabled: true, label: 'Cancel' },
      confirm: { enabled: true, label: 'Save', disabled: this.localName.trim().length === 0 },
    };
  }

  public localName: string = "";
  public localAllowances: any[] = [];

  public confirmingAllowanceIndex: number | null = null;
  public confirmingAllowanceLabel: string = "";

  mounted() {
    this.loadFromStore();
    this.modalInstance.isVisible = true;
    if (!this.rulesetStore.rulesetData.options.advancedTeamCreation?.skillPackages?.[this.packageName]) {
      this.$nextTick(() => this.nameInput?.focus());
    }
  }

  loadFromStore() {
    const pkg =
      this.rulesetStore.rulesetData.options.advancedTeamCreation
        ?.skillPackages?.[this.packageName];
    if (!pkg) {
      this.localName = "";
      this.localAllowances = [];
      return;
    }

    this.localName = pkg.name || "";
    this.localAllowances = JSON.parse(JSON.stringify(pkg.allowances || []));
  }

  onMaxSkillsChanged(aIndex: number) {
    const allowance = this.localAllowances[aIndex];
    if (!allowance) return;
    const target = Math.max(1, allowance.maxSkillsPerPlayer);
    allowance.maxSkillsPerPlayer = target;
    while (allowance.costSchedule.length < target) {
      allowance.costSchedule.push({});
    }
    if (allowance.costSchedule.length > target) {
      allowance.costSchedule.length = target;
    }
  }

  getCost(
    aIndex: number,
    slotIndex: number,
    skillType: string,
  ): number | string {
    return (
      this.localAllowances[aIndex]?.costSchedule?.[slotIndex]?.[skillType] ?? ""
    );
  }

  setCost(aIndex: number, slotIndex: number, skillType: string, value: string) {
    const allowance = this.localAllowances[aIndex];
    if (!allowance) return;
    if (!allowance.costSchedule) {
      allowance.costSchedule = [];
    }
    if (!allowance.costSchedule[slotIndex]) {
      allowance.costSchedule[slotIndex] = {};
    }
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      delete allowance.costSchedule[slotIndex][skillType];
    } else {
      allowance.costSchedule[slotIndex][skillType] = num;
    }
  }

  addAllowance() {
    this.localAllowances.push({
      label: "New Allowance",
      maxPlayers: 0,
      maxSkillsPerPlayer: 1,
      allowedSkillTypes: ["primary"],
      costSchedule: [{}],
    });
  }

  confirmRemoveAllowance(index: number) {
    const allowance = this.localAllowances[index];
    if (!allowance) return;
    this.confirmingAllowanceLabel = allowance.label || "Untitled";
    this.confirmingAllowanceIndex = index;
  }

  removeAllowance() {
    const index = this.confirmingAllowanceIndex;
    this.confirmingAllowanceIndex = null;
    if (index !== null) {
      this.localAllowances.splice(index, 1);
    }
  }

  ordinal(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  save() {
    const name = this.localName.trim();
    if (!name) return;

    const atc = this.rulesetStore.rulesetData.options.advancedTeamCreation;
    if (!atc.skillPackages) {
      atc.skillPackages = {};
    }

    const packages = atc.skillPackages;
    if (name !== this.packageName && packages[name]) {
      return;
    }

    const allowances = JSON.parse(JSON.stringify(this.localAllowances));
    const entry = { name, allowances };

    if (name === this.packageName) {
      packages[name] = entry;
    } else {
      const updated: Record<string, any> = {};
      for (const key of Object.keys(packages)) {
        if (key !== this.packageName) {
          updated[key] = packages[key];
        }
      }
      updated[name] = entry;
      atc.skillPackages = updated;

      const tierConfig = this.rulesetStore.rulesetData.options.advancedTeamCreation.tierConfig;
      if (tierConfig) {
        for (const tier of Object.keys(tierConfig)) {
          if (tierConfig[tier].skillPackage === this.packageName) {
            tierConfig[tier].skillPackage = name;
          }
        }
      }
    }

    this.emitSaved(name);
  }

  @Emit("saved")
  emitSaved(name: string) {
    return name;
  }
}

export default toNative(SkillPackageModal);
</script>
