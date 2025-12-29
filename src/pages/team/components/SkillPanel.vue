<template>
  <div
    v-show="selectedCategory == null || selectedCategory == category"
    id="skillPanelContainer"
    v-cloak
  >
    <div
      :class="[
        'button',
        { show: selectedCategory == null || selectedCategory == category },
      ]"
      @click="selectCategory(category)"
    >
      {{ category[0] == "C" ? "Choose" : "Random" }}
      {{ categories[category[1]] }}
    </div>
    <div
      v-if="selectedCategory == category && category != 'RC'"
      :class="[
        'skillcontainer',
        { show: selectedCategory == category && category != 'RC' },
        { chosen: category[0] == 'C' },
        { random: category[0] == 'R' },
      ]"
    >
      <div class="tableheader firstrow" v-show="category[0] == 'R'">
        D6 Roll 1&ndash;3
      </div>
      <div class="tableheader firstrow" v-show="category[0] == 'R'">
        D6 Roll 4&ndash;6
      </div>
      <template v-for="skill in getSkillColumns(category[1])">
        <div>
          <span v-show="category[0] == 'R'" class="tableheader firstcolumn">{{
            (skills[category[1]].indexOf(skill) % 6) + 1
          }}</span>
          <span
            @click="selectSkill"
            :class="[
              'skill',
              { selected: selectedSkill == skill },
              { notselected: selectedSkill != null && selectedSkill != skill },
              { unpickable: unpickableSkills.has(skill) },
              { rolled: rolledSkill == skill },
              {
                notrolled:
                  (rolledSkill != null && rolledSkill != skill) ||
                  (rolledSkills.length > 0 && !rolledSkills.includes(skill)),
              },
              { available: rolledSkills.includes(skill) },
            ]"
            >{{ skill }}</span
          >
        </div>
      </template>
    </div>
    <div
      v-if="
        selectedCategory == category && category == 'RC' && version == '2020'
      "
      class="skillcontainer random characteristic"
    >
      <div class="tableheader firstrow">D16</div>
      <div class="tableheader firstrow">Result</div>
      <div class="tableheader firstrow">Cost</div>
      <div class="tableheader firstrow">Characteristic</div>
      <div class="tableheader firstcolumn">1&ndash;7</div>
      <div
        :class="[
          { rolled: d16DieRoll >= 1 && d16DieRoll <= 7 },
          { notrolled: d16DieRoll > 0 && d16DieRoll > 7 },
        ]"
      >
        +MA or +AV
      </div>
      <div>20k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Movement' },
          { notselected: selectedStat != null && selectedStat != 'Movement' },
          {
            available: d16DieRoll > 0 && (d16DieRoll <= 13 || d16DieRoll == 16),
          },
        ]"
      >
        Movement
      </div>

      <div class="tableheader firstcolumn">8&ndash;13</div>
      <div
        :class="[
          { rolled: d16DieRoll >= 8 && d16DieRoll <= 13 },
          { notrolled: d16DieRoll > 0 && (d16DieRoll > 13 || d16DieRoll < 8) },
        ]"
      >
        +MA, +PA, or +AV
      </div>
      <div>80k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Strength' },
          { notselected: selectedStat != null && selectedStat != 'Strength' },
          { available: d16DieRoll > 0 && d16DieRoll >= 15 },
        ]"
      >
        Strength
      </div>

      <div class="tableheader firstcolumn">14</div>
      <div
        :class="[
          { rolled: d16DieRoll == 14 },
          { notrolled: d16DieRoll > 0 && d16DieRoll != 14 },
        ]"
      >
        +AG or +PA
      </div>
      <div>40k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Agility' },
          { notselected: selectedStat != null && selectedStat != 'Agility' },
          { available: d16DieRoll > 0 && d16DieRoll >= 14 },
        ]"
      >
        Agility
      </div>

      <div class="tableheader firstcolumn">15</div>
      <div
        :class="[
          { rolled: d16DieRoll == 15 },
          { notrolled: d16DieRoll > 0 && d16DieRoll != 15 },
        ]"
      >
        +ST or +AG
      </div>
      <div>20k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Passing' },
          { notselected: selectedStat != null && selectedStat != 'Passing' },
          { available: d16DieRoll >= 8 && d16DieRoll != 15 },
        ]"
      >
        Passing
      </div>

      <div class="tableheader firstcolumn">16</div>
      <div
        :class="[
          { rolled: d16DieRoll == 16 },
          { notrolled: d16DieRoll > 0 && d16DieRoll != 16 },
        ]"
      >
        Any Characteristic
      </div>
      <div>10k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Armour' },
          { notselected: selectedStat != null && selectedStat != 'Armour' },
          {
            available: d16DieRoll > 0 && (d16DieRoll <= 13 || d16DieRoll == 16),
          },
        ]"
      >
        Armour
      </div>
    </div>
    <div
      v-if="
        selectedCategory == category && category == 'RC' && version == '2025'
      "
      class="skillcontainer random characteristic"
    >
      <div class="tableheader firstrow">D8</div>
      <div class="tableheader firstrow">Result</div>
      <div class="tableheader firstrow">Cost</div>
      <div class="tableheader firstrow">Characteristic</div>
      <div class="tableheader firstcolumn">1</div>
      <div :class="[{ rolled: d8DieRoll == 1 }, { notrolled: d8DieRoll > 1 }]">
        +AV
      </div>
      <div>20k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Movement' },
          { notselected: selectedStat != null && selectedStat != 'Movement' },
          {
            available:
              d8DieRoll > 0 &&
              (d8DieRoll == 16 || (d8DieRoll >= 3 && d8DieRoll <= 6)),
          },
        ]"
      >
        Movement
      </div>

      <div class="tableheader firstcolumn">2</div>
      <div
        :class="[
          { rolled: d8DieRoll == 2 },
          { notrolled: d8DieRoll > 0 && d8DieRoll != 2 },
        ]"
      >
        +AV or +PA
      </div>
      <div>60k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Strength' },
          { notselected: selectedStat != null && selectedStat != 'Strength' },
          { available: d8DieRoll > 0 && d8DieRoll >= 7 },
        ]"
      >
        Strength
      </div>

      <div class="tableheader firstcolumn">3&mdash;4</div>
      <div
        :class="[
          { rolled: d8DieRoll == 3 || d8DieRoll == 4 },
          { notrolled: d8DieRoll > 0 && d8DieRoll != 3 && d8DieRoll != 4 },
        ]"
      >
        +AV, +MA, or +PA
      </div>
      <div>30k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Agility' },
          { notselected: selectedStat != null && selectedStat != 'Agility' },
          { available: d8DieRoll >= 6 },
        ]"
      >
        Agility
      </div>

      <div class="tableheader firstcolumn">5</div>
      <div
        :class="[
          { rolled: d8DieRoll == 5 },
          { notrolled: d8DieRoll > 0 && d8DieRoll != 5 },
        ]"
      >
        +MA or +PA
      </div>
      <div>20k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Passing' },
          { notselected: selectedStat != null && selectedStat != 'Passing' },
          { available: d8DieRoll == 8 || (d8DieRoll >= 2 && d8DieRoll <= 5) },
        ]"
      >
        Passing
      </div>

      <div class="tableheader firstcolumn">6</div>
      <div
        :class="[
          { rolled: d8DieRoll == 6 },
          { notrolled: d8DieRoll > 0 && d8DieRoll != 6 },
        ]"
      >
        +AG or +MA
      </div>
      <div>10k</div>
      <div
        @click="selectStat"
        :class="[
          'skill',
          { selected: selectedStat == 'Armour' },
          { notselected: selectedStat != null && selectedStat != 'Armour' },
          { available: d8DieRoll == 8 || (d8DieRoll >= 1 && d8DieRoll <= 4) },
        ]"
      >
        Armour
      </div>
      <div class="tableheader firstcolumn">7</div>
      <div
        :class="[
          { rolled: d8DieRoll == 7 },
          { notrolled: d8DieRoll > 0 && d8DieRoll != 7 },
        ]"
      >
        +AG or +ST
      </div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div class="tableheader firstcolumn">8</div>
      <div
        :class="[
          { rolled: d8DieRoll == 8 },
          { notrolled: d8DieRoll > 0 && d8DieRoll != 8 },
        ]"
      >
        Any Characteristic
      </div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>
    </div>

    <div
      v-if="
        (version == '2025' || !advancementLocked) &&
        selectedCategory == category &&
        category[0] == 'C' &&
        selectedSkill != null
      "
      @click="doSelect"
      class="button narrow show"
      id="selectSkillButton"
    >
      Choose {{ selectedSkill }}
    </div>
    <div
      v-if="
        !advancementLocked &&
        rolling == false &&
        selectedCategory == category &&
        category[0] == 'R' &&
        category[1] != 'C'
      "
      @click="doRoll"
      class="button narrow show"
      id="rollSkillButton"
    >
      Roll
    </div>
    <div
      v-if="
        !advancementLocked &&
        rolling == false &&
        selectedCategory == category &&
        category == 'RC' &&
        version == '2020'
      "
      @click="doD16Roll"
      class="button narrow show"
      id="rollSkillButton"
    >
      Roll D16
    </div>
    <div
      v-if="
        !advancementLocked &&
        rolling == false &&
        selectedCategory == category &&
        category == 'RC' &&
        version == '2025'
      "
      @click="doD8Roll"
      class="button narrow show"
      id="rollSkillButton"
    >
      Roll D8
    </div>
    <div v-show="selectedCategory != null" class="diceRolls">
      <div class="roll" v-show="rolling || skillStatus.rolls.length > 0">
        <Die type="d6" ref="columnDie" @complete="columnResult" />
        <Die type="d6" ref="rowDie" @complete="rowResult" />
        <div v-if="version == '2025'" class="spacer">&nbsp;</div>
        <Die
          v-if="version == '2025'"
          type="d6"
          ref="column2Die"
          @complete="column2Result"
        />
        <Die
          v-if="version == '2025'"
          type="d6"
          ref="row2Die"
          @complete="row2Result"
        />
      </div>
      <div
        class="statrollpanel"
        v-show="
          selectedCategory == 'RC' ||
          (version == '2025' &&
            selectedCategory == category &&
            category[0] == 'R')
        "
      >
        <div class="roll" v-if="d16DieRoll != null && selectedCategory == 'RC'">
          <Die type="d16" ref="d16Die" @complete="d16Result" />
        </div>
        <div class="roll" v-if="d8DieRoll != null && selectedCategory == 'RC'">
          <Die type="d8" ref="d8Die" @complete="d8Result" />
        </div>
        <div
          v-show="
            !categoryLocked &&
            selectedStat &&
            advancementLocked &&
            selectedCategory == category &&
            category == 'RC'
          "
          @click="doSelectStat"
          class="button narrow show"
          id="selectStatButton"
        >
          Select
        </div>
        <div
          v-show="
            selectedStat == null &&
            advancementLocked &&
            selectedCategory == category &&
            category == 'RC' &&
            d16DieRoll > 0 &&
            d16DieRoll < 16 &&
            version == '2020'
          "
          @click="doChooseSecondary"
          class="button narrow show"
          id="selectStatButton"
        >
          Choose skill instead
        </div>
        <div
          v-show="
            selectedStat == null &&
            advancementLocked &&
            selectedCategory == category &&
            category == 'RC' &&
            d8DieRoll > 0 &&
            version == '2025'
          "
          @click="doChooseSecondary"
          class="button narrow show"
          id="selectStatButton2025"
        >
          Choose skill instead
        </div>
        <div
          v-show="
            selectedSkill != null &&
            version == '2025' &&
            selectedCategory == category &&
            category[0] == 'R' &&
            rolledSkills.length > 0 &&
            rolledSkill == null
          "
          @click="doPickRandom"
          class="button narrow show"
          id="pickRandom2025Button"
        >
          Select {{ selectedSkill }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../style/skillpanel.less";
</style>

<script lang="ts">
import Axios from "axios";
import FumbblApi from "../include/FumbblApi";
import { PropType } from "vue";

import { Die } from "@components/fumbblcomponents";

import {
  Component,
  Vue,
  toNative,
  Ref,
  Prop,
  Emit,
  Watch,
} from "vue-facing-decorator";

@Component({
  components: {
    Die,
  },
})
class SkillPanel extends Vue {
  @Prop({ required: true }) playerId: number = 0;
  @Prop({ required: true }) category: string = "";
  @Prop({ required: true }) selectedCategory: string | null = null;
  @Prop({ required: true }) skills: { [category: string]: string[] } = {};
  @Prop({ required: true }) playerSkills: string[] = [];
  @Prop({ required: true }) blocked: string[] = [];
  @Prop({ required: true }) skillStatus: any;
  @Prop({ required: true }) version: string = "";
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Ref
  private columnDie: InstanceType<typeof Die> | undefined;
  @Ref
  private rowDie: InstanceType<typeof Die> | undefined;
  @Ref
  private column2Die: InstanceType<typeof Die> | undefined;
  @Ref
  private row2Die: InstanceType<typeof Die> | undefined;

  @Ref
  private d8Die: InstanceType<typeof Die> | undefined;
  @Ref
  private d16Die: InstanceType<typeof Die> | undefined;

  public selectedSkill: string | null = null;
  public unpickableSkills: Set<String> = new Set<String>();

  public rolledSkill: string | null = null;
  public rolledSkills: string[] = [];

  public apiBase: string = "";

  private roll: any = null;
  public rolling: boolean = false;

  public columnDieRoll: number = 0;
  public rowDieRoll: number = 0;
  public column2DieRoll: number = 0;
  public row2DieRoll: number = 0;
  public d8DieRoll: number = 0;
  public d16DieRoll: number = 0;

  public selectedStat: string | null = null;

  public advancementLocked: boolean = false;
  public categoryLocked: boolean = false;
  public initialized: boolean = false;

  public categories: any = {
    G: "General skill",
    A: "Agility skill",
    P: "Passing skill",
    M: "Mutation",
    S: "Strength skill",
    C: "Characteristic",
    D: "Devious skill",
  };

  public mounted() {
    this.unpickableSkills = new Set<string>(this.blocked);
    if (
      this.skillStatus != null &&
      this.skillStatus.rolls &&
      this.skillStatus.rolls.length > 0
    ) {
      this.rolling = true;
      if (this.version == "2020") {
        this.lockAdvancement();
        this.d16Die?.roll(this.skillStatus.rolls[0].roll1);
      } else if (this.version == "2025") {
        if (this.skillStatus.rolls[0].length == 2) {
          this.columnDie?.roll(this.skillStatus.rolls[0][0]);
          this.rowDie?.roll(this.skillStatus.rolls[0][1]);
          this.column2Die?.roll(this.skillStatus.rolls[1][0]);
          this.row2Die?.roll(this.skillStatus.rolls[1][1]);
        } else {
          this.lockAdvancement();
          this.d8Die?.roll(this.skillStatus.rolls[0].roll1);
        }
      }
    }
  }

  public updated() {
    if (this.category != this.selectedCategory) {
      return;
    }

    if (this.version != "2025") {
      return;
    }

    if (
      this.skillStatus.rolls.length == 0 ||
      this.skillStatus.rolls[0].roll2 == 0
    ) {
      return;
    }

    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.lockAdvancement();
    this.lockCategory();
    this.columnDie?.roll(this.skillStatus.rolls[0].roll1);
    this.rowDie?.roll(this.skillStatus.rolls[0].roll2);
    this.column2Die?.roll(this.skillStatus.rolls[0].roll3);
    this.row2Die?.roll(this.skillStatus.rolls[0].roll4);
  }

  private validateResponse(response) {
    if (typeof response == "string" && response.startsWith("Error")) {
      alert(response);
      return false;
    }
    return true;
  }

  public getSkillColumns(category: string) {
    let list: string[] = [];

    for (let i = 0; i < 6; i++) {
      list.push(this.skills[category][i]);
      list.push(this.skills[category][i + 6]);
    }

    return list;
  }

  public selectSkill(event) {
    if (!this.advancementLocked) {
      let skill = event.target.innerText;
      if (
        this.selectedCategory[0] == "C" &&
        !this.unpickableSkills.has(skill)
      ) {
        if (skill == this.selectedSkill) {
          skill = null;
        }
        this.selectedSkill = skill;
      }
    } else if (
      this.version == "2025" &&
      (this.rolledSkills.includes(event.target.innerText) ||
        this.category != "RC")
    ) {
      let skill = event.target.innerText;
      if (skill == this.selectedSkill) {
        skill = null;
      }
      this.selectedSkill = skill;
    }
  }

  public async doRoll() {
    this.lockAdvancement();
    this.lockCategory();
    this.rolling = true;

    const response = await this.fumbblApi?.rollSkill2020(
      this.playerId,
      this.selectedCategory[1],
    );

    if (this.version == "2020") {
      let roll1 = response.data.roll[0];
      let roll2 = response.data.roll[1];
      let skill = response.data.skill;

      this.columnDie?.roll(roll1);
      this.rowDie?.roll(roll2);
      this.roll = { roll: [roll1, roll2], desc: skill };
    } else if (this.version == "2025") {
      let roll1 = response.data.roll[0][0];
      let roll2 = response.data.roll[0][1];
      let roll3 = response.data.roll[1][0];
      let roll4 = response.data.roll[1][1];
      let skill = response.data.skill[0];
      let skill2 = response.data.skill[1];

      this.columnDie?.roll(roll1);
      this.rowDie?.roll(roll2);
      this.column2Die?.roll(roll3);
      this.row2Die?.roll(roll4);
      this.roll = {
        roll: [roll1, roll2, roll3, roll4],
        desc: skill + ", " + skill2,
      };
    }
  }

  public async doD16Roll() {
    this.lockAdvancement();
    this.rolling = true;

    let response = await this.fumbblApi?.rollCharacteristic(this.playerId);
    let roll = response.data.roll;
    this.d16Die?.roll(roll);
  }

  public async doD8Roll() {
    this.lockAdvancement();
    this.rolling = true;

    let response = await this.fumbblApi?.rollCharacteristic(this.playerId);
    let roll = response.data.roll;
    this.d8Die?.roll(roll);
  }

  public async doSelect() {
    this.lockAdvancement();

    let response = await Axios.post(
      this.apiBase +
        "/api/player/selectskill/" +
        this.playerId +
        "/" +
        this.selectedSkill,
    );

    if (this.validateResponse(response.data)) {
      this.skillAdded(this.selectedSkill);
    }
  }

  public async doPickRandom() {
    this.lockAdvancement();

    let response = await Axios.post(
      this.apiBase +
        "/api/player/selectrandomskill/" +
        this.playerId +
        "/" +
        this.selectedSkill,
    );

    if (this.validateResponse(response.data)) {
      this.skillAdded(this.selectedSkill);
    }
  }

  public async doSelectStat() {
    this.lockAdvancement();
    this.lockCategory();

    let response = await Axios.post(
      this.apiBase +
        "/api/player/selectcharacteristic/" +
        this.playerId +
        "/" +
        this.selectedStat,
    );
    if (this.validateResponse(response.data)) {
      this.skillAdded(this.selectedStat);
    }
  }

  @Emit("chooseSecondary")
  public doChooseSecondary() {}

  public columnResult(result: number) {
    this.columnDieRoll = result;

    if (this.rowDieRoll > 0) {
      this.showRollResult();
    }
  }

  public rowResult(result: number) {
    this.rowDieRoll = result;
    if (this.columnDieRoll > 0) {
      this.showRollResult();
    }
  }

  public column2Result(result: number) {
    this.column2DieRoll = result;

    if (this.row2DieRoll > 0) {
      this.showRollResult();
    }
  }

  public row2Result(result: number) {
    this.row2DieRoll = result;
    if (this.column2DieRoll > 0) {
      this.showRollResult();
    }
  }

  public d16Result(result: number) {
    this.d16DieRoll = result;
  }

  public d8Result(result: number) {
    this.d8DieRoll = result;
  }

  public showRollResult() {
    const roll1 = this.columnDieRoll;
    const roll2 = this.rowDieRoll;
    const roll3 = this.column2DieRoll;
    const roll4 = this.row2DieRoll;

    if (this.version == "2020") {
      this.skillAdded(
        this.skills[this.selectedCategory[1]][(roll1 > 3 ? 6 : 0) + roll2 - 1],
      );
    } else if (
      this.version == "2025" &&
      roll1 > 0 &&
      roll2 > 0 &&
      roll3 > 0 &&
      roll4 > 0
    ) {
      this.rolledSkills = [
        this.skills[this.selectedCategory[1]][(roll1 > 3 ? 6 : 0) + roll2 - 1],
        this.skills[this.selectedCategory[1]][(roll3 > 3 ? 6 : 0) + roll4 - 1],
      ];
    }
  }

  public selectStat(event) {
    if (!this.categoryLocked) {
      let stat = event.target.innerText;
      if (stat == this.selectedStat) {
        stat = null;
      }

      this.selectedStat = stat;
    }
  }

  public selectCategory(category: string): void {
    if (!this.advancementLocked || this.selectedCategory == null) {
      this.emitSelectCategory(category);
    }
  }

  public reset() {
    this.rolling = false;
    this.advancementLocked = false;
    this.categoryLocked = false;
    this.rolledSkill = null;
    this.selectedSkill = null;
    this.initialized = false;
    this.skillStatus = null;
  }

  @Emit("select")
  public emitSelectCategory(category: string): void {
    return category;
  }

  @Emit("lockAdvancement")
  public lockAdvancement() {
    this.advancementLocked = true;
  }

  @Emit("lockCategory")
  public lockCategory() {
    this.categoryLocked = true;
  }

  @Emit("skillAdded")
  public skillAdded(skill: string) {
    this.rolledSkill = skill;
    return skill;
  }
}

export default toNative(SkillPanel);
</script>
