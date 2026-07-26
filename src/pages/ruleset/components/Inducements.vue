<template>
  <div class="panel content" id="inducements" :key="rulesetStore.serial">
    <TitledPanel>
      <template #header>Inducements</template>
      <template #content>
        <dl class="inducementsettings">
          <dt>General Settings</dt>
          <dd name="options.clientOptions.inducementGold">
            <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementGold" :size="8" />
            extra gold is given to each coach for purchasing inducements.
          </dd>
          <dd v-if="rulesetStore.isVersion('2016')" name="options.clientOptions.cardGold">
            <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.cardGold" :size="8" />
            extra gold is given to each coach for purchasing cards.
          </dd>
          <dd>
            <Toggle name="options.clientOptions.pettyCashAffectsTv" v-model="rulesetStore.rulesetData.options.clientOptions.pettyCashAffectsTv" />
            Petty cash affects TV.
          </dd>
          <dd>
            <Toggle name="options.clientOptions.forceTreasuryToPettyCash" v-model="rulesetStore.rulesetData.options.clientOptions.forceTreasuryToPettyCash" />
            Treasury is automatically transferred to petty cash.
          </dd>
          <dd>
            <Toggle name="options.clientOptions.inducementsAllowSpendingTreasuryOnEqualCTV" v-model="rulesetStore.rulesetData.options.clientOptions.inducementsAllowSpendingTreasuryOnEqualCTV" />
            Allow spending treasury on inducements if CTV is equal.
          </dd>
          <dd>
            <Toggle name="options.clientOptions.inducementsAlwaysUseTreasury" v-model="rulesetStore.rulesetData.options.clientOptions.inducementsAlwaysUseTreasury" />
            Always use treasury for inducements (disables petty cash).
          </dd>
          <dd>
            <Toggle name="options.clientOptions.allowStarOnBothTeams" v-model="rulesetStore.rulesetData.options.clientOptions.allowStarOnBothTeams" />
            Allow the same star player to play on both teams.
          </dd>
          <dd>
            <Toggle name="options.clientOptions.megaStarsAvailable" v-model="rulesetStore.rulesetData.options.clientOptions.megaStarsAvailable" />
            Allow mega-stars to be induced.
          </dd>
          <dd>
            <Toggle name="options.clientOptions.inducementsAllowOverdogSpending" v-model="rulesetStore.rulesetData.options.clientOptions.inducementsAllowOverdogSpending" />
            Allow overdog spending.
          </dd>
          <dd>
            <Toggle name="options.clientOptions.inducementsAllowUnderdogSpending" v-model="rulesetStore.rulesetData.options.clientOptions.inducementsAllowUnderdogSpending" />
            Give the underdog an extra 50k gold to spend in inducements.
          </dd>

          <dt>Biased Ref</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementBiasedRefMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementBiasedRefMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementBiasedRefCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementBiasedRefCost" :size="8" />
            </span>
            gold each.
          </dd>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementBiasedRefReducedMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementBiasedRefReducedMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementBiasedRefReducedCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementBiasedRefReducedCost" :size="8" />
            </span>
            gold each for teams with special rule.
          </dd>

          <dt>Blitzer's Best Kegs</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementKegsMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementKegsMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementKegsCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementKegsCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Bribes</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementBribesMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementBribesMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementBribesCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementBribesCost" :size="8" />
            </span>
            gold each.
          </dd>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementBribesReducedMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementBribesReducedMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementBribesReducedCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementBribesReducedCost" :size="8" />
            </span>
            gold each for teams with special rule.
          </dd>

          <dt>Extra Team Training</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementExtraTrainingMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementExtraTrainingMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementExtraTrainingCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementExtraTrainingCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Halfling Master Chef</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementChefsMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementChefsMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementChefsCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementChefsCost" :size="8" />
            </span>
            gold each.
          </dd>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementChefsReducedMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementChefsReducedMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementChefsReducedCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementChefsReducedCost" :size="8" />
            </span>
            gold each for teams with special rule.
          </dd>

          <dt v-if="rulesetStore.isVersion('2016')">Igor</dt>
          <dd v-if="rulesetStore.isVersion('2016')">
            Max
            <span class="mleft" name="options.clientOptions.inducementIgorsMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementIgorsMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementIgorsCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementIgorsCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Mercenary Players</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementMercenariesMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementMercenariesMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementMercenariesExtraCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementMercenariesExtraCost" :size="8" />
            </span>
            <span class="wide">extra gold each,</span><br /><span class="wide">and</span>
            <span class="mleft" name="options.clientOptions.inducementMercenariesSkillCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementMercenariesSkillCost" :size="8" />
            </span>
            gold for a skill.
          </dd>

          <dt v-if="rulesetStore.isVersion('2020', '2025')">Mortuary Assistant</dt>
          <dd v-if="rulesetStore.isVersion('2020', '2025')">
            Max
            <span class="mleft" name="options.clientOptions.inducementMortuaryAssistantsMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementMortuaryAssistantsMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementMortuaryAssistantsCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementMortuaryAssistantsCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Part-time Assistant Coaches</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementPartTimeCoachMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementPartTimeCoachMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">up to a total maximum of</span>
            <span name="options.clientOptions.inducementPartTimeCoachTotalMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementPartTimeCoachTotalMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <br /><span class="wide">at</span>
            <span name="options.clientOptions.inducementPartTimeCoachCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementPartTimeCoachCost" :size="8" />
            </span>
            gold each.
          </dd>
        </dl>

        <dl class="inducementsettings">
          <dt>Plague Doctor</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementPlagueDoctorsMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementPlagueDoctorsMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementPlagueDoctorsCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementPlagueDoctorsCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt v-if="rulesetStore.isVersion('2020', '2025')">Prayers to Nuffle</dt>
          <dd v-if="rulesetStore.isVersion('2020', '2025')">
            Max
            <span class="mleft" name="options.clientOptions.inducementPrayersMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementPrayersMax">
                <option value="0">No Limit</option>
                <option v-for="i in range(1, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementPrayersCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementPrayersCost" :size="8" />
            </span>
            gold each.
          </dd>
          <dd v-if="rulesetStore.isVersion('2020')" name="options.clientOptions.inducementPrayersUseLeagueTable">
            Use
            <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementPrayersUseLeagueTable">
              <option value="false">Exhibition</option>
              <option value="true">League</option>
            </select>
            table for Prayers to Nuffle.
          </dd>
          <dd v-if="rulesetStore.isVersion('2020', '2025')">
            <Toggle name="options.clientOptions.inducementPrayersAvailableForUnderdog" v-model="rulesetStore.rulesetData.options.clientOptions.inducementPrayersAvailableForUnderdog" />
            Grant Prayers to Nuffle to underdog team during inducement phase.
          </dd>

          <dt>Riotous Rookies</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementRiotousRookiesMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementRiotousRookiesMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementRiotousRookiesCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementRiotousRookiesCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt v-if="rulesetStore.isVersion('2016')">Special Play Cards</dt>
          <dd v-if="rulesetStore.isVersion('2016')" name="options.clientOptions.maxCards">
            Maximum number of cards for each coach is
            <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.maxCards" :size="2" />.
          </dd>
          <dd v-if="rulesetStore.isVersion('2016')" name="options.clientOptions.cardsSpecialPlayCost">
            <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.cardsSpecialPlayCost" :size="8" />
            gold per Special Play Card.
          </dd>

          <dt>Star Players</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementStarsMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementStarsMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            Star Players can be hired.
          </dd>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementStaffMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementStaffMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            Infamous Coaching Staff can be hired.
          </dd>

          <dt v-if="rulesetStore.isVersion('2025')">Team Mascot</dt>
          <dd v-if="rulesetStore.isVersion('2025')">
            Max
            <span class="mleft" name="options.clientOptions.inducementMascotMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementMascotMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementMascotCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementMascotCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Temp Agency Cheerleaders</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementTempCheerleaderMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementTempCheerleaderMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">up to a total maximum of</span>
            <span name="options.clientOptions.inducementTempCheerleaderTotalMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementTempCheerleaderTotalMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <br /><span class="wide">at</span>
            <span name="options.clientOptions.inducementTempCheerleaderCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementTempCheerleaderCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Wandering Apothecary</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementAposMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementAposMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementAposCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementAposCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Weather Mage</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementWeatherMageMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementWeatherMageMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementWeatherMageCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementWeatherMageCost" :size="8" />
            </span>
            gold each.
          </dd>

          <dt>Wizard: Sports Wizard</dt>
          <dd>
            Max
            <span class="mleft" name="options.clientOptions.inducementWizardsMax">
              <select v-model="rulesetStore.rulesetData.options.clientOptions.inducementWizardsMax">
                <option v-for="i in range(0, 16)">{{ i }}</option>
              </select>
            </span>
            <span class="wide">at</span>
            <span name="options.clientOptions.inducementWizardsCost">
              <ExpandingInput v-model="rulesetStore.rulesetData.options.clientOptions.inducementWizardsCost" :size="8" />
            </span>
            gold each.
          </dd>
        </dl>
      </template>
    </TitledPanel>
  </div>
</template>

<style scoped>
@import "./inducements.less";
</style>

<script lang="ts">
import { Component, Vue, toNative } from "vue-facing-decorator";
import { useRulesetStore } from "../pinia/store";
import { TitledPanel, Toggle } from "@components/fumbblcomponents";
import ExpandingInput from "./ExpandingInput.vue";

@Component({
  components: {
    TitledPanel,
    Toggle,
    ExpandingInput,
  },
})
class Inducements extends Vue {
  public rulesetStore = useRulesetStore();

  public range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
  }
}

export default toNative(Inducements);
</script>
