<template>
  <div class="panel content" id="rosters" :key="rulesetStore.serial">
    <div class="col">
      <TitledPanel>
        <template #header>Enabled Rosters</template>
        <template #content>
          <dl>
            <dd>
              <table border="0" id="promotedrosters">
                <tbody>
                  <tr v-for="(roster, id) in rulesetStore.promoted">
                    <td>
                      <Toggle
                        :name="'selected.' + id"
                        v-model="rulesetStore.selected[id]"
                      />
                      {{ roster }}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Toggle
                        name="selected.custom"
                        v-model="rulesetStore.selected['custom']"
                      />
                      Custom - Enable this to use custom rosters outside the
                      preset ones from above.
                    </td>
                  </tr>
                </tbody>
              </table>
            </dd>
          </dl>
        </template>
      </TitledPanel>
    </div>
    <div class="col">
      <div class="import-bar" v-if="rulesetStore.isEditable">
        <a class="btn-import" href="#" @click.prevent="showImportModal"
          >Import Roster</a
        >
      </div>
      <TitledPanel>
        <template #header>Rosters</template>
        <template #content>
          <table class="rostertable">
            <tbody>
              <tr>
                <th width="10%">Source</th>
                <th width="10%">Enabled</th>
                <th colspan="2">Name</th>
              </tr>
              <template v-for="roster in rulesetStore.rosters">
                <tr>
                  <td class="right">
                    <span class="external" v-if="roster.type == 'PRE'"
                      >Preset</span
                    >
                    <span class="internal" v-if="roster.type == 'EXT'"
                      >Imported</span
                    >
                    <span class="custom" v-if="!roster.type">Own</span>
                  </td>
                  <td>
                    <Toggle
                      :name="'roster.' + roster.id + '.enabled'"
                      v-model="roster.enabled"
                    />
                  </td>
                  <td>
                    <a class="rosterlink" :href="'/p/race?id=' + roster.id">{{
                      roster.value
                    }}</a>
                  </td>
                  <td>
                    <a
                      v-if="!roster.type || roster.type == 'EXT'"
                      class=""
                      href=""
                      @click.prevent="confirmRemoveRoster(roster)"
                      >Remove</a
                    >
                    <span class="separator">&bull;</span>
                    <a
                      v-if="roster.type == 'EXT' || roster.type == 'PRE'"
                      href=""
                      @click.prevent="cloneLocal(roster.id)"
                      >Clone Local</a
                    >
                  </td>
                </tr>
              </template>
            </tbody>

            <tbody></tbody>
          </table>
        </template>
      </TitledPanel>
    </div>

    <Modal
      class="modal-import-roster"
      v-show="showImport === true"
      :modal-size="'medium'"
      :exclude-header="false"
      :exclude-buttons="true"
      @cancel="showImport = false"
    >
      <template #header>Import Roster</template>
      <template #body>
        <input
          ref="searchInput"
          type="text"
          placeholder="Search for roster"
          v-model="rosterSearch"
        />
        <div class="search-results-wrapper">
          <div class="search-results-header">
            <span class="col-owner">Owner</span>
            <span class="col-ruleset">Ruleset</span>
            <span class="col-name">Roster</span>
          </div>
          <div class="search-results">
            <template v-for="r in rosterSearchResult">
              <div class="search-result-item" @click="addRoster(r)">
                <span class="col-owner">{{ r.owner }}</span>
                <span class="col-ruleset">{{ r.ruleset }}</span>
                <span class="col-name">{{ r.name }}</span>
              </div>
            </template>
          </div>
        </div>
      </template>
    </Modal>

    <Modal
      class="modal-confirm-remove"
      v-show="modalConfirmRemove === true"
      :modal-size="'small'"
      :exclude-header="false"
      :exclude-buttons="false"
      @cancel="modalConfirmRemove = false"
      @confirm="removeRoster()"
    >
      <template #header>Remove Roster?</template>
      <template #body>
        <div class="pad">
          Are you sure you want to remove the '{{ rosterToBeRemoved.value }}'
          roster?
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
@import "./rosters.less";
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
class Rosters extends Vue {
  public rulesetStore = useRulesetStore();

  public showImport: boolean = false;
  public rosterSearch: string = "";
  public rosterSearchResult: any[] = [];

  public modalConfirmRemove: boolean = false;
  public rosterToBeRemoved: any = {};

  $refs!: {
    searchInput: HTMLInputElement;
  };

  private searchTimeout: number | undefined;

  public async cloneLocal(rosterId: number) {
    await this.rulesetStore.cloneLocal(rosterId);
  }

  public showImportModal() {
    this.rosterSearch = "";
    this.rosterSearchResult = [];
    this.showImport = true;
  }

  @Watch("showImport")
  public onShowImportChanged(val: boolean) {
    if (val) {
      this.$nextTick(() => this.$refs.searchInput?.focus());
    }
  }

  @Watch("rosterSearch")
  public doRosterSearch() {
    clearTimeout(this.searchTimeout);
    if (this.rosterSearch.length < 3) {
      this.rosterSearchResult = [];
      return;
    }
    this.searchTimeout = window.setTimeout(async () => {
      this.rosterSearchResult = await this.rulesetStore.searchRosters(
        this.rosterSearch,
        this.rulesetStore.savedData.options.rulesetOptions.version,
      );
    }, 300);
  }

  public async addRoster(r: any) {
    this.rosterSearch = "";
    this.showImport = false;
    await this.rulesetStore.addRoster(r.id);
  }

  public async confirmRemoveRoster(roster: any) {
    this.rosterToBeRemoved = roster;
    this.modalConfirmRemove = true;
  }

  public async removeRoster() {
    this.modalConfirmRemove = false;
    await this.rulesetStore.removeRoster(this.rosterToBeRemoved.id);
  }
}

export default toNative(Rosters);
</script>
