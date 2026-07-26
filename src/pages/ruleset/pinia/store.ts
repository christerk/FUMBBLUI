import { defineStore } from "pinia";
import { ref, shallowRef, computed, type ComputedRef } from "vue";
import FumbblApi from "@api/fumbbl";
import { TrackedDoc } from "./tracker";

class RulesetStore {
  private fumbblApi = new FumbblApi();

  // ── Tracked documents ────────────────────────────────
  readonly rulesetData = ref<any>({
    options: {
      rulesetOptions: {},
      teamSettings: {},
      clientOptions: {},
      advancedTeamCreation: { tierConfig: {} },
    },
  });
  readonly savedData = shallowRef<any>({
    options: {
      rulesetOptions: {},
      teamSettings: {},
      clientOptions: {},
      advancedTeamCreation: { tierConfig: {} },
    },
  });
  readonly selected = ref<Record<string, boolean>>({});
  private readonly opaquePaths = [
    "options.advancedTeamCreation.skillPackages",
    "options.advancedTeamCreation.tierConfig",
  ];

  private rulesetDoc!: TrackedDoc<any>;
  private selectedDoc!: TrackedDoc<any>;

  // ── Standalone state ──────────────────────────────────
  readonly loading = ref(true);
  readonly serial = ref(0);
  readonly isEditable = ref(false);
  readonly rulesetLoaded = ref(false);

  readonly tierData = ref<any>({});
  readonly categories = ref<any[]>([]);
  readonly skills = ref<any[]>([]);
  readonly promoted = ref<any[]>([]);

  readonly rosters = ref<any[]>([]);
  readonly rosterCache = ref<Record<number, any>>({});
  private savedRosterCache: Record<number, any> = {};

  // ── Computed ──────────────────────────────────────────
  readonly importedRosters: ComputedRef<string[]>;
  readonly currentChanges: ComputedRef<Array<{ key: string; val: any }>>;

  constructor() {
    this.rulesetDoc = new TrackedDoc(this.rulesetData.value, this.opaquePaths);
    this.selectedDoc = new TrackedDoc(this.selected.value);

    this.importedRosters = computed(() => {
      const result: string[] = [];
      for (const x in this.selected.value) {
        if (this.selected.value[x] === true) result.push(x);
      }
      return result;
    });

    this.currentChanges = computed(() => {
      const changes: Array<{ key: string; val: any }> = [];

      for (const c of this.rulesetDoc.getChanges()) {
        if (c.key !== "rosters") changes.push(c);
      }

      // Stringify opaque JSON fields for the backend
      for (const c of changes) {
        if (typeof c.val === "object" && this.opaquePaths.includes(c.key)) {
          c.val = JSON.stringify(c.val);
        }
      }

      if (!this.selectedDoc.shallowSavedEquals(this.selected.value)) {
        const availableRosters = Object.entries(this.selected.value)
          .filter(([_, value]) => value === true)
          .map(([key]) => key)
          .join(",");

        changes.push({
          key: "options.rosterSettings.availableRosters",
          val: availableRosters,
        });
      }

      for (const index in this.rosters.value) {
        const a = this.rosters.value[index];
        const b = this.savedRosterCache[a.id];
        if (!b) continue;

        if (a.tier != b.tier) {
          changes.push({ key: "roster." + a.id + ".tier", val: a.tier });
        }
        if (a.enabled != b.enabled) {
          changes.push({ key: "roster." + a.id + ".enabled", val: a.enabled });
        }
      }

      return changes;
    });
  }

  // ── Dirty helpers ────────────────────────────────────

  isDirty = (path: string): boolean => {
    if (path.startsWith("selected.")) {
      const key = path.replace("selected.", "");
      return this.selected.value[key] !== this.selectedDoc.baseline[key];
    }
    if (path.startsWith("roster.")) {
      const match = path.match(/roster\.(\d+)\.(.+)/);
      if (match) {
        const [, id, prop] = match;
        return (
          this.rosterCache.value[Number(id)]?.[prop] !==
          this.savedRosterCache[Number(id)]?.[prop]
        );
      }
      return false;
    }
    return this.rulesetDoc.isFieldDirty(path);
  };

  isVersion = (...versions: string[]): boolean => {
    return versions.includes(
      this.rulesetData.value.options.rulesetOptions.version,
    );
  };

  // ── Data loading ─────────────────────────────────────

  loadRuleset = async (id: number) => {
    this.loading.value = true;

    const ruleset = await this.fumbblApi.Ruleset.getRuleset(id);
    if (!ruleset) {
      this.loading.value = false;
      return;
    }

    this.savedData.value = structuredClone(ruleset);
    const dataClone = structuredClone(ruleset);

    // Parse opaque JSON string fields to objects for working copy
    for (const target of [ruleset, dataClone]) {
      for (const path of this.opaquePaths) {
        const parts = path.split(".");
        const field = parts.pop()!;
        const parent = parts.reduce((o: any, p) => o?.[p], target);
        if (parent && typeof parent[field] === "string") {
          try {
            parent[field] = JSON.parse(parent[field]);
          } catch {
            parent[field] = {};
          }
        }
      }
    }

    this.rosters.value.length = 0;
    this.savedRosterCache = {};

    this.rulesetDoc.reset(ruleset);

    const [cats, sk, pro] = await Promise.all([
      this.fumbblApi.Skill.getCategories(
        ruleset.options.rulesetOptions.version,
      ),
      this.fumbblApi.Skill.list(ruleset.options.rulesetOptions.version),
      this.fumbblApi.Ruleset.promoted(ruleset.options.rulesetOptions.version),
    ]);
    this.categories.value = cats;
    this.skills.value = sk;
    this.promoted.value = pro;

    // ── Initialise selected roster map ──
    const rosterMap: Record<string, boolean> = {};
    for (const p in pro) rosterMap[String(p)] = false;
    rosterMap["custom"] = false;

    const available =
      ruleset.options.rosterSettings.availableRosters?.split(",") ?? [];
    for (const p of available) {
      const r = p.trim();
      if (r) rosterMap[r] = true;
    }

    this.selectedDoc.reset(rosterMap);

    // ── Build expanded roster list ──
    for (const p of available) {
      const roster = p.trim();
      if (roster && roster !== "custom") {
        const externalRuleset = await this.fumbblApi.Ruleset.getRuleset(roster);
        for (const r in externalRuleset.rosters) {
          const er = externalRuleset.rosters[r];
          er.external = true;
          er.type = "PRE";
          er.tier = 0;
          if (!this.rosters.value.find((rr: any) => rr.id == er.id)) {
            this.rosters.value.push(er);
            this.savedRosterCache[er.id] = structuredClone(er);
          }
        }
      } else if (rosterMap["custom"]) {
        for (const r in dataClone.rosters) {
          const customRoster = dataClone.rosters[r];
          customRoster.external = customRoster.type == "EXT";
          const customRuleset = customRoster.ruleset;

          if (
            rosterMap[customRuleset] === false &&
            customRuleset != this.rulesetData.value.id
          )
            continue;
          if (
            rosterMap[customRuleset] === undefined &&
            customRuleset != this.rulesetData.value.id
          ) {
            customRoster.type = "EXT";
            customRoster.external = true;
          }
          this.rosters.value = this.rosters.value.filter(
            (rr: any) => rr.id != customRoster.id,
          );
          this.rosters.value.push(customRoster);
          this.savedRosterCache[customRoster.id] = structuredClone(
            dataClone.rosters[r],
          );
        }
      }
    }
    this.rosters.value.sort((a: any, b: any) => a.value.localeCompare(b.value));

    for (const id in this.savedRosterCache) {
      const r = this.savedRosterCache[id];
      if (r.enabled === undefined) r.enabled = true;
    }

    // ── Tiers ──
    if (!this.rulesetData.value.tiers) {
      for (const roster of this.rosters.value) {
        this.rosterCache.value[roster.id] = roster;
      }
      this.rebuildTierData();
    }

    // ── Permissions ──
    this.isEditable.value = false;
    for (const m in ruleset.managers) {
      if (ruleset.managers[m].type === "SELF") {
        this.isEditable.value = true;
        break;
      }
    }

    this.rulesetLoaded.value = true;
    this.serial.value++;
    this.loading.value = false;
  };

  // ── Mutations ────────────────────────────────────────

  saveChanges = async () => {
    if (this.currentChanges.value.length == 0) return;

    this.loading.value = true;
    try {
      await this.fumbblApi.Ruleset.save(
        this.rulesetData.value.id,
        this.currentChanges.value,
      );
    } catch {
      /* ignore */
    }
    await this.loadRuleset(this.rulesetData.value.id);
  };

  addManager = async (coach: any) => {
    await this.fumbblApi.Ruleset.addManager(
      this.rulesetData.value.id,
      coach.id,
    );
    await this.loadRuleset(this.rulesetData.value.id);
  };

  removeManager = async (coach: any) => {
    await this.fumbblApi.Ruleset.removeManager(
      this.rulesetData.value.id,
      coach.id,
    );
    await this.loadRuleset(this.rulesetData.value.id);
  };

  searchCoaches = (query: string): Promise<any> => {
    return this.fumbblApi.Coach.search(query);
  };

  searchRosters = (
    query: string,
    version: string | null = null,
  ): Promise<any> => {
    return this.fumbblApi.Roster.search(query, version);
  };

  addRoster = async (rosterId: number) => {
    await this.fumbblApi.Roster.add(this.rulesetData.value.id, rosterId);
    await this.loadRuleset(this.rulesetData.value.id);
  };

  removeRoster = async (rosterId: number) => {
    await this.fumbblApi.Roster.remove(this.rulesetData.value.id, rosterId);
    this.rosters.value = this.rosters.value.filter(
      (r: any) => r.id != rosterId,
    );
  };

  setRosterTier = (rosterId: number, newTier: number) => {
    const roster = this.rosters.value.find((r: any) => r.id == rosterId);
    if (roster) {
      roster.tier = newTier;
      this.rebuildTierData();
    }
  };

  rebuildTierData = () => {
    const td: Record<string, { name: string; rosters: number[] }> = {};
    const seen = new Set<number>();
    for (const roster of this.rosters.value) {
      if (seen.has(roster.id)) continue;
      seen.add(roster.id);
      const key = String(roster.tier);
      if (!td[key]) {
        td[key] = { name: String(roster.tier), rosters: [] };
      }
      td[key].rosters.push(roster.id);
    }
    const tierNums = Object.keys(td).map(Number);
    if (tierNums.length > 0) {
      const min = Math.min(...tierNums);
      const max = Math.max(...tierNums);
      for (let t = min; t <= max; t++) {
        const key = String(t);
        if (!td[key]) {
          td[key] = { name: String(t), rosters: [] };
        }
      }
    }
    this.tierData.value = td;
    this.serial.value++;
  };

  cloneLocal = async (rosterId: number) => {
    const roster = this.rosters.value.find((r: any) => r.id == rosterId);
    if (!roster) return;

    const newId = await this.fumbblApi.Roster.cloneLocal(
      this.rulesetData.value.id,
      rosterId,
    );
    const newRoster = {
      id: parseInt(newId),
      external: false,
      ruleset: this.rulesetData.value.id,
      value: roster.value,
      tier: roster.tier,
      enabled: true,
    };
    this.rosters.value.push(newRoster);
    this.savedRosterCache[newRoster.id] = structuredClone(newRoster);
    this.rosterCache.value[newRoster.id] = newRoster;
    this.rosters.value.sort((a: any, b: any) => a.value.localeCompare(b.value));
    this.serial.value++;
  };
}

export const useRulesetStore = defineStore("ruleset", () => new RulesetStore());
