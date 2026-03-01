<template>
  <div class="container" id="vuecontent">
    <div class="header">
      <div class="title">Client Options</div>
      <ul class="tabs">
        <li
          @click="showTab('Auto Marking')"
          :class="[activeTab == 'Auto Marking' ? 'active' : 'inactive']"
        >
          Auto Marking
        </li>
        <li
          @click="showTab('Pitches')"
          :class="[activeTab == 'Pitches' ? 'active' : 'inactive']"
        >
          Pitches
        </li>
      </ul>
    </div>
    <div class="content">
      <div class="tabPage" v-show="activeTab == 'Auto Marking'">
        <div class="controlpanel automarking">
          <button class="controlbutton" id="new" @click="newMarking()">
            Add Marking
          </button>
          <div id="separator">
            Separator
            <select v-model="separator" @change="saveSeparator()">
              <option value="">None</option>
              <option value=",">Comma</option>
              <option value=" ">Space</option>
            </select>
          </div>
          <button class="controlbutton" id="import" @click="showImport()">
            Import
          </button>
        </div>

        <div class="markings">
          <div class="header">
            <div>Marking</div>
            <div>Type</div>
            <div>Teams</div>
            <div>Skills</div>
            <div>Injuries</div>
          </div>

          <SortableTable
            v-if="markings !== undefined"
            :Items="markings"
            :key="markingKey"
            @onEnd="onMarkingMoved"
          >
            <template v-slot="row">
              <div class="row handle" @click="editMarking(row.item)">
                <div>{{ row.item.marking }}</div>
                <div>{{ row.item.gainedOnly ? "Gained" : "All" }}</div>
                <div>{{ row.item.applyTo }}</div>
                <div>{{ row.item.skillArray.join(", ") }}</div>
                <div>
                  {{
                    row.item.injuryAttributes
                      ? row.item.injuryAttributes.join(", ")
                      : ""
                  }}
                </div>
              </div>
            </template>
          </SortableTable>
        </div>
      </div>

      <div class="tabPage" v-show="activeTab == 'Pitches'">
        <div class="controlpanel pitches">
          These settings allow you to disable specific pitch images, which will
          fall back to the Default one.
        </div>

        <div class="pitchColumns">
          <table class="pitches" id="special">
            <thead>
              <tr>
                <th>Special Pitches</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td class="separator"><div></div></td>
              </tr>
              <template v-for="(pitch, index) in pitches">
                <template v-if="pitch.category == 'Special'">
                  <tr>
                    <td>
                      <label class="toggler-wrapper style-4">
                        <input
                          type="checkbox"
                          :checked="pitch.enabled"
                          @change="togglePitch($event)"
                          :index="index"
                        />;
                        <div class="toggler-slider">
                          <div class="toggler-knob"></div>
                        </div>
                      </label>
                      {{ pitch.name }}
                    </td>
                  </tr>
                  <tr>
                    <td class="separator"><div></div></td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>

          <table class="pitches" id="roster">
            <thead>
              <tr>
                <th>Roster Pitches</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td class="separator"><div></div></td>
              </tr>
              <template v-for="(pitch, index) in pitches">
                <template v-if="pitch.category == 'Roster'">
                  <tr>
                    <td>
                      <label class="toggler-wrapper style-4">
                        <input
                          type="checkbox"
                          :checked="pitch.enabled"
                          @change="togglePitch($event)"
                          :index="index"
                        />;
                        <div class="toggler-slider">
                          <div class="toggler-knob"></div>
                        </div>
                      </label>
                      {{ pitch.name }}
                    </td>
                  </tr>
                  <tr>
                    <td class="separator"><div></div></td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <div class="dialogbackpane" v-if="showMarkingDialog" @click="hideDialogs">
        <div id="markingdialog" class="dialog">
          <div class="dialogtitle">Edit Marking</div>
          <div id="controls">
            <div id="settings">
              <div>Marking</div>
              <div>
                <input type="text" id="marking" v-model="markingString" />
              </div>
              <div>Type</div>
              <div>
                <select v-model="markingType">
                  <option>All</option>
                  <option>Gained</option>
                </select>
              </div>
              <div>Teams</div>
              <div>
                <select v-model="teams">
                  <option value="BOTH">Both</option>
                  <option value="OWN">Own</option>
                  <option value="OPPONENT">Opponent</option>
                </select>
              </div>
              <div>Apply Repeatedly</div>
              <div><input type="checkbox" v-model="applyRepeatedly" /></div>
            </div>

            <div id="skills">
              <div class="span2 section">Skills</div>
              <template v-for="skill in currentSkills">
                <div class="skill">{{ skill }}</div>
                <div class="skill removelink" @click="removeSkill(skill)">
                  Remove
                </div>
              </template>

              <div class="add span2">
                <select @change="addSkill($event)" v-model="selectedSkill">
                  <option>Add Skill</option>
                  <template v-for="skill in skills">
                    <option :value="skill.name">
                      {{ skill.name }} ({{ skill.ruleset }})
                    </option>
                  </template>
                </select>
              </div>

              <div class="span2 section second">Injuries</div>
              <template v-for="injury in currentInjuries">
                <div class="injury">{{ injury }}</div>
                <div class="injury removelink" @click="removeInjury(injury)">
                  Remove
                </div>
              </template>

              <div class="add span2">
                <select @change="addInjury($event)" v-model="selectedInjury">
                  <option>Add Injury</option>
                  <template v-for="injury in injuries">
                    <option>{{ injury }}</option>
                  </template>
                </select>
              </div>
            </div>
          </div>

          <div class="dialogcontrols">
            <button class="controlbutton closeButton" @click="deleteMarking()">
              Delete
            </button>
            <button
              class="controlbutton closeButton"
              @click="hideMarkingDialog()"
            >
              Cancel
            </button>
            <button class="controlbutton closeButton" @click="saveMarking()">
              Save
            </button>
          </div>
        </div>
      </div>

      <div class="dialogbackpane" v-if="showImportDialog" @click="hideDialogs">
        <div id="importdialog" class="dialog">
          <div class="dialogtitle">Import Markings</div>

          <div id="controls">
            <div>
              <input
                ref="importname"
                id="importname"
                type="text"
                placeholder="Enter coach name"
                v-model="importname"
              />
            </div>
          </div>

          <div class="dialogcontrols">
            <button
              class="controlbutton closeButton"
              @click="hideImportDialog()"
            >
              Cancel
            </button>
            <button class="controlbutton closeButton" @click="importMarkings()">
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "./clientoptions.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref } from "vue-facing-decorator";
import Progress from "../boxtrophy/progress.vue";
import FumbblApi from "../team/include/FumbblApi";
import SeasonPicker from "../boxtrophy/seasonpicker.vue";

import Axios from "axios";
import { SortableTable } from "@components/fumbblcomponents";

@Component({
  components: {
    SortableTable,
  },
})
class ClientOptions extends Vue {
  public fumbblApi: FumbblApi = new FumbblApi();
  public apiBase: string = "";

  private debugString = "foo";

  showMarkingDialog = false;
  showImportDialog = false;
  importname = "";
  editedMarking: any = null;
  currentSkills: any = [];
  currentInjuries: any = [];
  markingString: any = "";
  markingType = "";
  teams = "";
  selectedSkill = "Add Skill";
  selectedInjury = "Add Injury";
  skills: any = [];
  markings: any = [];
  injuries: any = [];
  applyRepeatedly: any;
  separator: any;
  activeTab = "Auto Marking";

  pitches: any = [];

  startDragIndex: number | null = null;
  markingKey = 0;

  async mounted() {
    if (window.location.host.indexOf("dev.") !== 0) {
      this.apiBase = "https://" + window.location.host;
    }
    this.pitches = [
      { category: "Special", key: "Blackbox", name: "Blackbox", enabled: true },
      {
        category: "Special",
        key: "FumbblCup",
        name: "FUMBBL Cup",
        enabled: true,
      },
      { category: "Special", key: "NAF", name: "NAF", enabled: true },

      { category: "Roster", key: "Amazon", name: "Amazon", enabled: true },
      { category: "Roster", key: "Chaos", name: "Chaos", enabled: true },
      { category: "Roster", key: "Darkelf", name: "Dark Elf", enabled: true },
      { category: "Roster", key: "Goblin", name: "Goblin", enabled: true },
      { category: "Roster", key: "Highelf", name: "High Elf", enabled: true },
      { category: "Roster", key: "Khorne", name: "Khorne", enabled: true },
      {
        category: "Roster",
        key: "Lizardmen",
        name: "Lizardmen",
        enabled: true,
      },
      {
        category: "Roster",
        key: "Necromantic",
        name: "Necromantic Horror",
        enabled: true,
      },
      { category: "Roster", key: "Norse", name: "Norse", enabled: true },
      { category: "Roster", key: "Nurgle", name: "Nurgle", enabled: true },
      { category: "Roster", key: "Skaven", name: "Skaven", enabled: true },
      { category: "Roster", key: "Slaanesh", name: "Slaanesh", enabled: true },
      {
        category: "Roster",
        key: "TombKings",
        name: "Tomb Kings",
        enabled: true,
      },
      { category: "Roster", key: "Tzeentch", name: "Tzeentch", enabled: true },
      { category: "Roster", key: "Vampire", name: "Vampire", enabled: true },
    ];

    let skills2020 = (await this.fumbblApi.listSkills("2020")).data.map(
      function (s: any) {
        s.ruleset = "2020";
        return s;
      },
    );
    let skills2025 = (await this.fumbblApi.listSkills("2025")).data.map(
      function (s: any) {
        s.ruleset = "2025";
        return s;
      },
    );
    const allSkills = [...skills2025, ...skills2020];
    this.skills = [];
    let addedSkills = new Set();
    for (let s in allSkills) {
      if (!addedSkills.has(allSkills[s].name)) {
        addedSkills.add(allSkills[s].name);
        this.skills.push(allSkills[s]);
      }
    }
    this.skills.sort((a: any, b: any) => a.name.localeCompare(b.name));

    await this.loadMarkings(null);
    this.injuries = ["AG", "AV", "MA", "NI", "PA", "ST"];
  }

  onMarkingMoved() {
    this.saveMarkings();
  }

  showTab(tab: string) {
    this.activeTab = tab;
  }

  hideDialogs(ev: any) {
    if (ev.target.classList.contains("dialogbackpane")) {
      this.showMarkingDialog = false;
      this.showImportDialog = false;
    }
  }

  newMarking() {
    this.editedMarking = null;
    this.selectedSkill = "Add Skill";
    this.selectedInjury = "Add Injury";

    this.currentSkills = [];
    this.currentInjuries = [];
    this.markingString = "";
    this.markingType = "All";
    this.teams = "BOTH";
    this.showMarkingDialog = true;
    this.applyRepeatedly = false;
  }

  editMarking(marking: any) {
    this.editedMarking = marking;

    this.selectedSkill = "Add Skill";
    this.selectedInjury = "Add Injury";
    this.currentSkills = Object.assign([], marking.skillArray);
    this.currentInjuries = Object.assign([], marking.injuryAttributes);
    this.markingString = marking.marking;
    this.markingType = marking.gainedOnly ? "Gained" : "All";
    this.teams = marking.applyTo;
    this.showMarkingDialog = true;
    this.applyRepeatedly = marking.applyRepeatedly;
  }

  hideMarkingDialog() {
    this.showMarkingDialog = false;
  }

  saveMarking() {
    if (!this.markings) {
      this.markings = [];
    }

    if (this.editedMarking == null) {
      this.markings.push({
        skillArray: this.currentSkills,
        injuryAttributes: this.currentInjuries,
        marking: this.markingString,
        gainedOnly: this.markingType == "Gained",
        applyTo: this.teams,
        applyRepeatedly: this.applyRepeatedly,
      });
    } else {
      this.editedMarking.skillArray = this.currentSkills;
      this.editedMarking.injuryAttributes = this.currentInjuries;
      this.editedMarking.marking = this.markingString;
      this.editedMarking.gainedOnly = this.markingType == "Gained";
      this.editedMarking.applyTo = this.teams;
      this.editedMarking.applyRepeatedly = this.applyRepeatedly;
    }

    this.saveMarkings();

    this.showMarkingDialog = false;
  }

  deleteMarking() {
    if (this.editedMarking != null) {
      let index = this.markings.findIndex((m: any) => m == this.editedMarking);
      this.markings.splice(index, 1);
      this.saveMarkings();
    }
    this.showMarkingDialog = false;
  }

  removeSkill(skillToRemove: any) {
    this.currentSkills = this.currentSkills.filter(
      (item: any) => item != skillToRemove,
    );
  }

  addSkill(ev: any) {
    if (
      this.selectedSkill != "Add Skill" &&
      this.currentSkills.indexOf(this.selectedSkill) < 0
    ) {
      this.currentSkills.push(this.selectedSkill);
    }
    this.selectedSkill = "Add Skill";
  }

  removeInjury(injuryToRemove: any) {
    this.currentInjuries = this.currentInjuries.filter(
      (item: any) => item != injuryToRemove,
    );
  }

  addInjury(ev) {
    if (
      this.selectedInjury != "Add Injury" &&
      this.currentInjuries.indexOf(this.selectedInjury) < 0
    ) {
      this.currentInjuries.push(this.selectedInjury);
    }
    this.selectedInjury = "Add Injury";
  }

  validateResponse(response: any) {
    if (typeof response == "string" && response.startsWith("Error")) {
      alert(response);
      return false;
    }
    return true;
  }

  async loadMarkings(coach: string | null = null) {
    let result = (await this.fumbblApi.getClientOptions(coach)).data;

    this.markings = result.autoMarkingRecords;
    this.separator = result.autoMarkingSeparator
      ? result.autoMarkingSeparator
      : "";

    for (var index in this.pitches) {
      var key = this.pitches[index].key;

      if (key in result.pitches) {
        this.pitches[index].enabled = result.pitches[key];
      }
    }
  }

  async saveMarkings() {
    const data = JSON.stringify(this.markings);
    await this.fumbblApi.saveMarkings(data);
    this.markingKey++;
  }

  async saveSeparator() {
    await this.fumbblApi.setClientOptionsSeparator(this.separator);
  }

  showImport() {
    this.showImportDialog = true;
    this.$nextTick(() => {
      document.getElementById("importname").focus();
    });
  }

  hideImportDialog() {
    this.showImportDialog = false;
  }

  async importMarkings() {
    let result = (
      await this.fumbblApi.getClientOptionsMarkings(this.importname)
    ).data.autoMarkingRecords;
    if (result && result.length > 0) {
      this.markings = result;

      this.saveMarkings();
    } else {
      alert("No markings to import");
    }
    this.showImportDialog = false;
  }

  togglePitch(ev) {
    var index = parseInt(ev.target.attributes["index"].value);
    var value = ev.target.checked;

    this.pitches[index].enabled = value;

    this.savePitches();
  }

  async savePitches() {
    var pitchData = Object.assign(
      {},
      ...this.pitches.map(({ key, name, enabled }) => ({
        [key]: enabled,
      })),
    );

    await this.fumbblApi.setPitches(pitchData);
  }
}

export default toNative(ClientOptions);
</script>
