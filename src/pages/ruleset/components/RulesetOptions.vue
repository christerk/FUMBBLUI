<template>
  <div class="panel content" id="rulesetoptions" :key="rulesetStore.serial">
    <div class="col">
      <TitledPanel>
        <template #header>Ruleset</template>
        <template #content>
          <dl>
            <dt>Ruleset Name</dt>
            <dd name="name">
              <input v-model="rulesetStore.rulesetData.name" type="text" />
            </dd>
            <dt>Ruleset Options</dt>
            <dd>
              <Toggle
                name="options.rulesetOptions.active"
                v-model="rulesetStore.rulesetData.options.rulesetOptions.active"
              />
              Enable ruleset. Allows groups to use this ruleset.
            </dd>
            <dd>
              <Toggle
                name="options.rulesetOptions.crossLeagueMatches"
                v-model="rulesetStore.rulesetData.options.rulesetOptions.crossLeagueMatches"
              />
              Allow cross-league matches, assuming ruleset is the same.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.testMode"
                v-model="rulesetStore.rulesetData.options.clientOptions.testMode"
              />
              Force Test Mode.
            </dd>
            <dt>Managers</dt>
            <dd>
              <div class="manager-list">
                <template v-for="m in rulesetStore.rulesetData.managers">
                  <a :href="'/~' + m.value">{{ m.value }}</a>
                  <div>
                    <template v-if="rulesetStore.isEditable && m.type != 'SELF'"
                      ><a :coachid="m.id" href="#" @click.prevent="removeManager(m)"
                        >Remove</a
                      ></template
                    >
                  </div>
                </template>
              </div>
              <div v-if="rulesetStore.isEditable" class="center">
                <a href="#" @click.prevent="showAddManagerModal"
                  >Add Manager</a
                >
              </div>
            </dd>
          </dl>
        </template>
      </TitledPanel>
    </div>
  </div>

  <Modal
    class="modal-add-manager"
    v-show="modalAddManager === true"
    :modal-size="'small'"
    :exclude-header="false"
    :exclude-buttons="true"
    @cancel="modalAddManager = false"
  >
    <template #header>Add Manager</template>
    <template #body>
      <input
        ref="managerSearchInput"
        type="text"
        placeholder="Search for coach"
        v-model="managerSearch"
      />

      <div class="search-results-wrapper">
        <div class="search-results">
          <template v-for="coach in managerSearchResult">
            <div class="search-result-item" @click="addManager(coach)">
              {{ coach.name }}
            </div>
          </template>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
@import "./rulesetoptions.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Watch } from "vue-facing-decorator";
import { useRulesetStore } from "../pinia/store";
import { TitledPanel, Toggle, Modal } from "@components/fumbblcomponents";

@Component({
  components: {
    TitledPanel,
    Toggle,
    Modal,
  },
})
class RulesetOptions extends Vue {
  public rulesetStore = useRulesetStore();

  public modalAddManager: boolean = false;
  public managerSearch: string = "";
  public managerSearchResult: any[] = [];

  $refs!: {
    managerSearchInput: HTMLInputElement;
  };

  public showAddManagerModal() {
    this.managerSearch = "";
    this.managerSearchResult = [];
    this.modalAddManager = true;
    this.$nextTick(() => this.$refs.managerSearchInput?.focus());
  }

  public hideAddManagerModal() {
    this.modalAddManager = false;
  }

  private searchTimeout: number | undefined;
  @Watch("managerSearch")
  public doManagerSearch() {
    clearTimeout(this.searchTimeout);
    if (this.managerSearch.length > 2) {
      this.searchTimeout = window.setTimeout(async () => {
        this.managerSearchResult = await this.rulesetStore.searchCoaches(
          this.managerSearch,
        );
      }, 300);
    }
  }

  public async addManager(coach: any) {
    this.managerSearch = "";
    this.hideAddManagerModal();
    await this.rulesetStore.addManager(coach);
  }

  public async removeManager(coach: any) {
    await this.rulesetStore.removeManager(coach);
  }
}

export default toNative(RulesetOptions);
</script>
