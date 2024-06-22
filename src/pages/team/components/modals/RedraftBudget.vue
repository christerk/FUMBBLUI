<template>
  <modal
    v-show="isVisible"
    modalSize="'medium'"
    :button-settings="{
      cancel: { enabled: showConfirm, label: 'Cancel' },
      confirm: { enabled: showConfirm, label: 'Redraft' },
    }"
    :exclude-header="false"
    :exclude-buttons="!showConfirm"
    @cancel="hide()"
    @confirm="confirm()"
  >
    <template v-slot:header> Redrafting budget calculation </template>

    <template v-slot:body>
      <div class="budget">
        <div class="line">
          <div class="label">Base</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftInfo().base / 1000 }}k</div>
        </div>
        <div class="line">
          <div class="label">Treasury</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftLimits().treasury / 1000 }}k</div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerGame > 0">
          <div class="label">Games</div>
          <div class="val">
            {{ team.seasonInfo.gamesPlayedInCurrentSeason }}
          </div>
          <div class="val">
            x{{ team.getRedraftInfo().goldPerGame / 1000 }}k
          </div>
          <div class="sum">
            {{
              (team.seasonInfo.gamesPlayedInCurrentSeason *
                team.getRedraftInfo().goldPerGame) /
              1000
            }}k
          </div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerWin > 0">
          <div class="label">Wins</div>
          <div class="val">{{ team.seasonInfo.wins }}</div>
          <div class="val">x{{ team.getRedraftInfo().goldPerWin / 1000 }}k</div>
          <div class="sum">
            {{
              (team.seasonInfo.wins * team.getRedraftInfo().goldPerWin) / 1000
            }}k
          </div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerTie > 0">
          <div class="label">Ties</div>
          <div class="val">{{ team.seasonInfo.ties }}</div>
          <div class="val">x{{ team.getRedraftInfo().goldPerTie / 1000 }}k</div>
          <div class="sum">
            {{
              (team.seasonInfo.ties * team.getRedraftInfo().goldPerTie) / 1000
            }}k
          </div>
        </div>
        <div class="line" v-if="team.getRedraftInfo().goldPerLoss > 0">
          <div class="label">Losses</div>
          <div class="val">{{ team.seasonInfo.losses }}</div>
          <div class="val">
            x{{ team.getRedraftInfo().goldPerLoss / 1000 }}k
          </div>
          <div class="sum">
            {{
              (team.seasonInfo.losses * team.getRedraftInfo().goldPerLoss) /
              1000
            }}k
          </div>
        </div>
        <div class="line summary">
          <div class="label">Budget</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">
            {{
              (team.getRedraftInfo().base +
                team.getRedraftLimits().treasury +
                team.seasonInfo.gamesPlayedInCurrentSeason *
                  team.getRedraftInfo().goldPerGame +
                team.seasonInfo.wins * team.getRedraftInfo().goldPerWin +
                team.seasonInfo.ties * team.getRedraftInfo().goldPerTie +
                team.seasonInfo.losses * team.getRedraftInfo().goldPerLoss) /
              1000
            }}k
          </div>
        </div>

        <div
          class="line small"
          v-if="
            team.getRedraftInfo().budgetCap != team.getRedraftInfo().redraftCap
          "
        >
          <div class="label">Baseline cap</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftingCap() / 1000 }}k</div>
        </div>
        <div
          class="line small"
          v-if="
            team.getRedraftInfo().budgetCap != team.getRedraftInfo().redraftCap
          "
        >
          <div class="label">Cap limit</div>
          <div class="val" style="grid-column: 2 / 4">
            {{ team.getRedraftInfo().base / 1000 }}k +<br />
            {{ team.getRedraftInfo().redraftRamp / 1000 }}k / game
          </div>
          <div class="sum">
            {{ team.getRedraftInfo().cappedBudget / 1000 }}k
          </div>
        </div>

        <div class="line small">
          <div class="label">Budget cap</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftInfo().budgetCap / 1000 }}k</div>
        </div>

        <div class="line summary">
          <div class="label">Capped budget</div>
          <div class="val"></div>
          <div class="val"></div>
          <div class="sum">{{ team.getRedraftLimits().budget / 1000 }}k</div>
        </div>
      </div>
    </template>
  </modal>
</template>

<style scoped>
@import "@pages/team/style/redraftingbudget.less";
</style>

<script lang="ts">
import { Prop, Component, Vue, toNative, Emit } from "vue-facing-decorator";
import ModalComponent from "../Modal.vue";
import Team from "../../include/Team";

@Component({
  components: {
    modal: ModalComponent,
  },
})
class RedraftBudgetModal extends Vue {
  @Prop({ required: true })
  public team!: Team;

  @Prop({ required: false })
  public showConfirm: boolean = false;

  public isVisible: boolean = false;

  @Emit("cancelled")
  public cancel() {
    this.hide();
  }

  @Emit("confirmed")
  public confirm() {
    this.hide();
  }

  public show() {
    this.isVisible = true;
  }

  public hide() {
    this.isVisible = false;
  }
}
export default toNative(RedraftBudgetModal);
</script>
