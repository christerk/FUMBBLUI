<template>
  <div
    class="container ruleset"
    id="vuecontent"
    ref="pageElement"
    :class="{ 'read-only': !!rulesetId && !rulesetStore.isEditable }"
  >
    <template v-if="!rulesetId">
      <PageHeader ref="nav" :navItems="false">
        <template #pagename>Rulesets</template>
      </PageHeader>

      <div class="ruleset-list">
        <TitledPanel>
          <template #header><div class="groupname">My Rulesets</div></template>
          <template #content>
            <div v-if="rulesetList.length === 0" class="empty-message">
              No rulesets found.
            </div>
            <div v-else>
              <div
                v-for="group in rulesetGroups"
                :key="group.version"
                class="ruleset-group"
              >
                <div class="group-header">{{ group.version }}</div>
                <div
                  v-for="rs in group.items"
                  :key="rs.id"
                  class="ruleset-item"
                  @click="openRuleset(rs.id)"
                >
                  {{ rs.value }}
                </div>
              </div>
            </div>
          </template>
        </TitledPanel>

        <div class="create-button-wrap">
          <button class="create-button" @click="showCreateModal">
            Create New Ruleset
          </button>
        </div>
      </div>

      <Modal
        ref="createModal"
        :buttonSettings="{
          cancel: { enabled: true, label: 'Cancel' },
          confirm: { enabled: true, label: 'Create' },
        }"
        @cancel="cancelCreate"
        @confirm="confirmCreate"
      >
        <template #header
          ><div class="groupname">Create New Ruleset</div></template
        >
        <template #body>
          <div class="create-ruleset">
            <div class="field">
              <label
                >Template
                <span class="note"
                  >(rules version can not be changed after creation)</span
                ></label
              >
              <div class="template-cards">
                <div
                  v-for="tpl in templates"
                  :key="tpl.id"
                  class="template-card"
                  :class="{
                    selected: newRulesetBaseline === tpl.id,
                    'col-2': tpl.id === 2228,
                  }"
                  @click="newRulesetBaseline = tpl.id"
                >
                  {{ tpl.label }}
                </div>
              </div>
            </div>
            <div class="field">
              <label>Name</label>
              <input
                v-model="newRulesetName"
                type="text"
                placeholder="Ruleset Name"
                ref="createNameInput"
              />
            </div>
          </div>
        </template>
      </Modal>
    </template>

    <template v-else>
      <PageHeader ref="nav" :navItems="false" defaultPage="rulesetoptions">
        <template #pagename>{{ rulesetStore.savedData.name }}</template>
        <template #right>
          <div class="version">
            <span class="label">Rules Version</span>
            <span class="number">{{
              rulesetStore.savedData.options.rulesetOptions.version
            }}</span>
          </div>
        </template>
        <template #center>
          <div class="controls">
            <button
              @click="rulesetStore.saveChanges()"
              :class="{
                menu: true,
                inactive:
                  rulesetStore.loading ||
                  rulesetStore.currentChanges.length == 0,
              }"
            >
              <template v-if="!rulesetStore.loading"
                >Save {{ rulesetStore.currentChanges.length }} changes</template
              >
              <template v-else>Loading</template>
            </button>
          </div>
        </template>
      </PageHeader>

      <div class="nav">
        <template v-for="item in navItems">
          <a
            :class="{ navitem: true, selected: page == item.page }"
            :href="'#' + item.page"
            @click.prevent="setPage(item.page)"
            >{{ item.label }}</a
          >
        </template>
      </div>

      <RulesetOptions v-if="page == 'rulesetoptions'" />
      <Mechanics v-if="page == 'mechanics'" />
      <Seasons v-if="page == 'seasons'" />
      <TeamSettings v-if="page == 'teamsettings'" />
      <SkillSettings v-if="page == 'skillsettings'" />
      <Inducements v-if="page == 'inducements'" />
      <Rosters v-if="page == 'rosters'" />
      <AdvancedTeamCreation v-if="page == 'advancedteamcreation'" />
      <Tiers v-if="page == 'tiers'" />
    </template>
  </div>
  <div v-if="rulesetId">
    {{ rulesetStore.currentChanges }}
  </div>
</template>

<style scoped>
@import "./ruleset.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref } from "vue-facing-decorator";
import { useRulesetStore } from "./pinia/store";

import FumbblApi from "@api/fumbbl";
import { PageHeader, TitledPanel, Modal } from "@components/fumbblcomponents";

import RulesetOptions from "./components/RulesetOptions.vue";
import Mechanics from "./components/Mechanics.vue";
import Seasons from "./components/Seasons.vue";
import TeamSettings from "./components/TeamSettings.vue";
import SkillSettings from "./components/SkillSettings.vue";
import Inducements from "./components/Inducements.vue";
import Rosters from "./components/Rosters.vue";
import AdvancedTeamCreation from "./components/AdvancedTeamCreation.vue";
import Tiers from "./components/Tiers.vue";

@Component({
  components: {
    PageHeader,
    TitledPanel,
    Modal,
    RulesetOptions,
    Mechanics,
    Seasons,
    TeamSettings,
    SkillSettings,
    Inducements,
    Rosters,
    AdvancedTeamCreation,
    Tiers,
  },
})
class Ruleset extends Vue {
  public rulesetStore = useRulesetStore();
  public navItems: any = [
    { label: "Ruleset Options", page: "rulesetoptions" },
    { label: "Seasons", page: "seasons" },
    { label: "Mechanics", page: "mechanics" },
    { label: "Team Settings", page: "teamsettings" },
    { label: "Skills", page: "skillsettings" },
    { label: "Inducements", page: "inducements" },
    { label: "Rosters", page: "rosters" },
    { label: "Adv. Team Creation", page: "advancedteamcreation" },
    { label: "Tiers", page: "tiers" },
  ];
  @Ref
  public pageElement!: HTMLElement;

  public page: string = "";
  public rulesetId: number | null = null;
  public rulesetList: any[] = [];
  public newRulesetName: string = "";
  public newRulesetBaseline: number = 3906;
  public templates = [
    { id: 1, label: "BB2016" },
    { id: 4, label: "BB2020" },
    { id: 3906, label: "BB2025" },
    { id: 2228, label: "NAF 2020" },
  ];
  @Ref
  public createModal!: InstanceType<typeof Modal>;
  @Ref
  public createNameInput!: HTMLInputElement;
  private fumbbl: FumbblApi = new FumbblApi();

  public async created() {
    const that = this;
    window.onpopstate = function (ev) {
      if (ev.state && ev.state.page) {
        that.setPage(ev.state.page, false);
      }
    };
  }

  private storeUnsubscribe: (() => void) | null = null;

  public async mounted() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const id = idParam ? parseInt(idParam) : NaN;

    if (isNaN(id)) {
      this.rulesetId = null;
      await this.loadRulesetList();
    } else {
      this.rulesetId = id;
      await this.rulesetStore.loadRuleset(id);
      const hash = window.location.hash.replace("#", "");
      const validPages = this.navItems.map((i: any) => i.page);
      if (hash && validPages.includes(hash)) {
        this.setPage(hash, false);
      } else {
        this.setPage("rulesetoptions", false);
      }
      this.storeUnsubscribe = this.rulesetStore.$subscribe(() => {
        this.$nextTick(() => this.updateDirtyIndicators());
      });
    }
  }

  public unmounted() {
    this.storeUnsubscribe?.();
  }

  public setPage(page: string, storeHistory: boolean = true) {
    if (storeHistory && page != this.page) {
      window.history.pushState({ page: page }, "", "#" + page);
    }
    this.page = page;
  }

  public async saveChanges() {
    await this.rulesetStore.saveChanges();
  }

  public reloadPage() {
    this.setPage(this.page);
  }

  public get rulesetGroups(): { version: string; items: any[] }[] {
    const groups = new Map<string, any[]>();
    for (const rs of this.rulesetList) {
      const v = rs.version ?? "Unknown";
      if (!groups.has(v)) groups.set(v, []);
      groups.get(v)!.push(rs);
    }
    for (const [, items] of groups) {
      items.sort((a: any, b: any) => a.value.localeCompare(b.value));
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
      .map(([version, items]) => ({ version, items }));
  }

  public async loadRulesetList() {
    const result = await this.fumbbl.Ruleset.list();
    this.rulesetList = result.rulesets ?? result;
  }

  public openRuleset(id: number) {
    window.location.href = `${window.location.pathname}?id=${id}`;
  }

  public showCreateModal() {
    this.newRulesetName = "";
    this.newRulesetBaseline = 3906;
    this.createModal.show();
    this.$nextTick(() => this.createNameInput?.focus());
  }

  public cancelCreate() {
    this.createModal.hide();
  }

  public async confirmCreate() {
    if (!this.newRulesetName.trim()) return;
    const created = await this.fumbbl.Ruleset.create(
      this.newRulesetName.trim(),
      this.newRulesetBaseline,
    );
    window.location.href = `${window.location.pathname}?id=${created}`;
  }

  private updateDirtyIndicators() {
    if (!this.pageElement) return;
    this.pageElement.querySelectorAll<HTMLElement>("[name]").forEach((el) => {
      const path = el.getAttribute("name");
      if (path) el.classList.toggle("changed", this.rulesetStore.isDirty(path));
    });
  }
}

export default toNative(Ruleset);
</script>
