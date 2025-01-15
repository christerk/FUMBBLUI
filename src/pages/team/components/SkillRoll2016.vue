<template>
  <div class="skillrollcomponent">
    <PlayerCard ref="card" />
    <template v-if="player != null">
      <TitledPanel>
        <template #header>Skill Roll</template>
        <template #content>
          <div class="skillroll">
            <die type="d6" ref="skillDie1"></die>
            <die type="d6" ref="skillDie2" @complete="rollsComplete"></die>
          </div>
          <div class="controls" v-show="showControls">
            <select v-model="selectedSkill">
              <option value="0" disabled="true" selected="true">
                [Select Skill]
              </option>
              <template v-for="choice in availableChoices" :key="choice[0]">
                <option :class="'type' + choice[2]" :value="choice[0]">
                  {{ choice[1] }}
                </option>
              </template>
            </select>
            <button @click="selectSkill">Select Skill</button>
          </div>
        </template>
      </TitledPanel>
    </template>
  </div>
  <ErrorModal ref="errorModal" />
</template>

<style scoped>
@import "../style/skillroll2016.less";
</style>

<script lang="ts">
import {
  Component,
  Vue,
  toNative,
  Ref,
  Prop,
  Emit,
} from "vue-facing-decorator";
import Player from "../include/Player";
import { Die, TitledPanel, ErrorModal } from "@components/fumbblcomponents";
import PlayerCard from "./PlayerCard.vue";
import FumbblApi from "../include/FumbblApi";
import { PropType } from "vue";
import { RulesetVersion } from "../include/Interfaces";

@Component({
  components: {
    die: Die,
    PlayerCard,
    TitledPanel,
    ErrorModal,
  },
})
class SkillRoll2016 extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: String as PropType<RulesetVersion>,
    required: true,
  })
  public rulesetVersion!: RulesetVersion;

  @Ref
  public errorModal: InstanceType<typeof ErrorModal> | undefined;

  @Ref
  private skillDie1: InstanceType<typeof Die> | undefined;
  @Ref
  private skillDie2: InstanceType<typeof Die> | undefined;
  @Ref
  public card!: InstanceType<typeof PlayerCard>;

  public availableChoices: any = [];

  public player: Player | null = null;
  public showControls: boolean = false;
  public selectedSkill: any = 0;

  public setPlayer(player: Player | undefined) {
    this.selectedSkill = 0;
    if (player == undefined) {
      this.player = null;
      return;
    }

    this.card.setPlayer(player);
    this.player = player;

    this.showControls = false;
    this.$nextTick(async () => {
      const skillStatus: any = (
        await this.fumbblApi?.getSkillStatus(this.player!.id)
      )?.data;
      if (skillStatus == undefined || skillStatus.rolls.length == 0) {
        this.close();
        return;
      }

      this.skillDie1?.roll(skillStatus.rolls[0].roll1);
      this.skillDie2?.roll(skillStatus.rolls[0].roll2);

      const allowedSkills = (
        await this.fumbblApi?.getAllowedSkills(this.player!.id)
      )?.data;

      this.availableChoices = [];
      allowedSkills.forEach((s: any) => {
        this.availableChoices.push([s.skillTypeId, s.skill, s.type]);
      });
    });
  }

  public rollsComplete() {
    this.showControls = true;
  }

  public async selectSkill() {
    if (this.player == null) {
      return;
    }
    const response = await this.fumbblApi?.selectSkill2016(
      this.player.id,
      this.selectedSkill,
    );

    if (!response?.isSuccessful()) {
      this.errorModal?.show({
        general: response?.getErrorMessage(),
        technical: "",
      });
      return;
    } else {
      this.availableChoices.filter;

      const skill = this.availableChoices.filter(
        (c: any) => c[0] == this.selectedSkill,
      )[0][1];
      this.player.addSkill(skill);

      this.setPlayer(this.player);
    }
  }

  @Emit("close")
  public close() {}
}

export default toNative(SkillRoll2016);
</script>
