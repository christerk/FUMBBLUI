<template>
  <div class="skillrollcomponent">
    <PlayerCard ref="card" />

    <div class="sppProgress" v-if="initialized">
      <div class="progressBar" :style="{ width: getSppProgress() }">
        <div
          class="projectedCost"
          v-bind:style="{ width: projectedCost + '%' }"
        ></div>
      </div>
      <div class="sppText">Available SPP {{ skillStatus.availableSpp }}</div>
    </div>
    <div
      class="advancements"
      v-if="initialized"
      :class="[
        { sel1: selectedAdvancement == skillStatus.limits[0]['id'] },
        { sel2: selectedAdvancement == skillStatus.limits[1]['id'] },
        { sel3: selectedAdvancement == skillStatus.limits[2]['id'] },
        { sel4: selectedAdvancement == skillStatus.limits[3]['id'] },
      ]"
    >
      <template v-for="limit in skillStatus.limits">
        <div
          @click="selectAdvancement(limit)"
          @mouseover="projectAdvancement(limit['spp'])"
          @mouseleave="projectAdvancement(0)"
          :id="limit['id']"
          :class="[
            'advancement',
            { available: skillStatus.availableSpp >= limit['spp'] },
            { unavailable: skillStatus.availableSpp < limit['spp'] },
            {
              show:
                selectedAdvancement == null ||
                selectedAdvancement == limit['id'],
            },
          ]"
        >
          <div class="cost">{{ limit["spp"] }} SPP</div>
          <div class="title" v-html="limit['description']"></div>
          <div class="tv">{{ limit["cost"] }} TV</div>
        </div>
      </template>
      <div class="rollContainer" v-if="selectedAdvancement != null">
        <div class="rollPanel">
          <template v-for="category in availableCategories">
            <SkillPanel
              :ref="'skillpanel' + category"
              @select="selectCategory"
              @lockAdvancement="lockAdvancement"
              @lockCategory="lockCategory"
              @skillAdded="skillAdded"
              @chooseSecondary="chooseSecondary"
              :playerId="player?.id"
              :skillStatus="category != '' ? skillStatus : null"
              :playerSkills="[...positionSkills, ...playerSkills]"
              :skills="skills"
              :selectedCategory="selectedCategory"
              :category="category"
              :blocked="skillStatus['skills']['blocked']"
              :fumbblApi="fumbblApi"
              :version="ruleset"
            >
            </SkillPanel>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../style/skillroll2020.less";
</style>

<script lang="ts">
import { PropType } from "vue";
import SkillPanel from "../components/SkillPanel.vue";
import { Die } from "@components/fumbblcomponents";
import PlayerCard from "./PlayerCard.vue";
import Player from "../include/Player";
import { Position, RulesetVersion } from "../include/Interfaces";
import FumbblApi from "../include/FumbblApi";

import {
  Component,
  Vue,
  Ref,
  Prop,
  Emit,
  toNative,
} from "vue-facing-decorator";

@Component({
  components: {
    SkillPanel,
    Die,
    PlayerCard,
  },
})
class SkillRoll2020 extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: String as PropType<RulesetVersion>,
    required: true,
  })
  public ruleset: RulesetVersion = "UNKNOWN";

  @Ref
  public card!: InstanceType<typeof PlayerCard>;

  public title: string = "Select Skill";
  public apiBase: string = "";
  private availableSpp: number = 0;
  public player: Player | null = null;
  private position: Position | null = null;

  public playerSkills: string[] = [];
  public positionSkills: string[] = [];
  public playerSkillString: string = "";

  public skills: { [category: string]: string[] } = {};
  public availableCategories: string[] = [];
  private advancementLocked: boolean = false;
  private categoryLocked: boolean = false;

  public skillStatus: any | null = null;

  public initialized: boolean = false;
  public projectedCost: number = 0;
  public selectedCategory: string | null = null;
  public selectedAdvancement: string | null = null;

  public async setPlayer(player: Player | undefined, position: Position) {
    if (player == undefined) {
      this.player = null;
      return;
    }
    this.player = player;
    this.position = position;

    this.$nextTick(async () => {
      this.card.setPlayer(player);
      const skillStatus: any = (
        await this.fumbblApi?.getSkillStatus(this.player!.id)
      )?.data;

      if (skillStatus == undefined) {
        this.close();
        return;
      }
      this.skillStatus = skillStatus;

      const skills: any[] = (await this.fumbblApi?.listSkills(this.ruleset))
        ?.data;
      skills.forEach((s) => {
        if (!this.skills.hasOwnProperty(s.category)) {
          this.skills[s.category] = [];
        }
        this.skills[s.category].push(s.name);
      });

      this.resetPanels();
      await this.$nextTick();
      if (skillStatus.rolls.length > 0) {
        if (this.ruleset == "2025" && skillStatus.rolls[0].category != "") {
          this.selectAdvancement(skillStatus.limits[0], true);
          this.selectedCategory = "R" + skillStatus.rolls[0].category;
          this.advancementLocked = true;
          this.categoryLocked = true;
        } else {
          this.selectAdvancement(skillStatus.limits[3], true);
        }
      }
      this.initialized = true;
    });
  }

  private resetPanels() {
    this.selectedCategory = null;
    this.selectedAdvancement = null;
    this.advancementLocked = false;
    this.categoryLocked = false;

    for (var ref in this.$refs) {
      const panel = this.$refs[ref] as InstanceType<typeof SkillPanel>;
      if (panel != undefined && panel.reset != undefined) {
        panel.reset();
      }
    }
  }

  private getProgressLength(spp: number, sppKey: string) {
    let limitCount = this.skillStatus.limits.length;
    let progress = 0;

    for (let i = 0; i < limitCount; i++) {
      let low = i == 0 ? 0 : parseInt(this.skillStatus.limits[i - 1][sppKey]);
      let high = parseInt(this.skillStatus.limits[i][sppKey]);
      if (spp >= high) {
        progress += 100 / limitCount;
      } else if (spp > low) {
        progress += (25 * (spp - low)) / (high - low);
      }
    }

    return progress;
  }

  public getSppProgress(): string {
    let progress = this.getProgressLength(this.skillStatus.availableSpp, "spp");

    return Math.min(100, progress) + "%";
  }

  private getProjectedCost(spp: number) {
    if (spp <= 0) {
      return 0;
    }
    let progress = this.getProgressLength(this.skillStatus.availableSpp, "spp");
    let newProgress = this.getProgressLength(
      this.skillStatus.availableSpp - spp,
      "next",
    );

    let delta = progress - newProgress;

    return 100 * (delta / progress);
  }

  public selectAdvancement(limit: any, force: boolean = false) {
    if (force || !this.advancementLocked) {
      if (!force && this.selectedAdvancement == limit["id"]) {
        limit = null;
      }

      if (limit == null) {
        this.projectedCost = 0;
        this.selectedAdvancement = null;
        this.selectedCategory = null;
      } else {
        if (this.skillStatus.availableSpp >= limit["spp"]) {
          this.selectedAdvancement = limit["id"];
          this.projectedCost = this.getProjectedCost(limit["spp"]);
          this.updateCategories();
        }
      }
    }
  }

  private updateCategories() {
    this.availableCategories = [];

    switch (this.selectedAdvancement) {
      case "randomPrimary":
        this.position?.primarySkills.forEach((c: string) =>
          this.availableCategories.push("R" + c),
        );
        break;
      case "chosenPrimary":
        this.position?.primarySkills.forEach((c: string) =>
          this.availableCategories.push("C" + c),
        );
        if (this.ruleset == "2020") {
          this.position?.secondarySkills.forEach((c) =>
            this.availableCategories.push("R" + c),
          );
        }
        break;
      case "chosenSecondary":
        this.position?.secondarySkills.forEach((c) =>
          this.availableCategories.push("C" + c),
        );
        break;
      case "characteristic":
        this.availableCategories.push("RC");
        this.position?.primarySkills.forEach((c) =>
          this.availableCategories.push("C" + c),
        );
        this.position?.secondarySkills.forEach((c) =>
          this.availableCategories.push("C" + c),
        );
        break;
    }

    if (
      this.availableCategories.length == 1 ||
      this.selectedAdvancement == "characteristic"
    ) {
      this.selectCategory(this.availableCategories[0]);
    }
  }

  public selectCategory(category: string | null) {
    if (!this.categoryLocked) {
      if (
        this.selectedCategory == category &&
        this.availableCategories.length > 1 &&
        category != "RC"
      ) {
        category = null;
        this.roll = null;
      }

      this.selectedCategory = category;
    }
  }

  public chooseSecondary() {
    this.roll = null;
    this.selectedCategory = null;
  }

  public lockAdvancement() {
    this.advancementLocked = true;
  }

  public lockCategory() {
    this.categoryLocked = true;
  }

  public skillAdded(skill: string) {
    this.playerSkills.push(skill);
    this.player.addSkill(skill);
    this.card.setPlayer(this.player);
    this.updateSkillString();
    this.categoryLocked = false;
  }

  public projectAdvancement(spp) {
    if (this.selectedAdvancement == null && spp <= this.availableSpp) {
      this.projectedCost = this.getProjectedCost(spp);
    }
  }

  private updateSkillString() {
    this.playerSkillString = this.playerSkills.join(", ");
  }

  @Emit("close")
  public close() {}
}

export default toNative(SkillRoll2020);
</script>
