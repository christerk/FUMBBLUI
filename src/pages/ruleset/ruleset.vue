<template>
  <div class="container ruleset" id="vuecontent" ref="pageElement">
    <PageHeader ref="nav" :navItems="false" defaultPage="rulesetoptions">
      <template #pagename>{{ savedData.name }}</template>
      <template #right>
        <div class="version">
          <span class="label">Rules Version</span>
          <span class="number">{{
            savedData.options.rulesetOptions.version
          }}</span>
        </div>
      </template>
      <template #center>
        <div class="controls">
          <button
            @click="saveChanges()"
            :class="{
              menu: true,
              inactive: loading || currentChanges.length == 0,
            }"
          >
            <template v-if="!loading"
              >Save {{ currentChanges.length }} changes</template
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
    <div
      class="panel content"
      id="rulesetoptions"
      v-if="page == 'rulesetoptions'"
      :key="serial"
    >
      <div class="col">
        <TitledPanel>
          <template #header>Ruleset</template>
          <template #content>
            <dl>
              <dt>Ruleset Name</dt>
              <dd name="name">
                <input v-model="rulesetData.name" type="text" />
              </dd>
              <dt>Ruleset Options</dt>
              <dd>
                <Toggle
                  name="options.rulesetOptions.active"
                  v-model="rulesetData.options.rulesetOptions.active"
                />
                Enable ruleset. Allows groups to use this ruleset.
              </dd>
              <dd>
                <Toggle
                  name="options.rulesetOptions.crossLeagueMatches"
                  v-model="
                    rulesetData.options.rulesetOptions.crossLeagueMatches
                  "
                />
                Allow cross-league matches, assuming ruleset is the same.
              </dd>
              <dd>
                <Toggle
                  name="options.clientOptions.testMode"
                  v-model="rulesetData.options.clientOptions.testMode"
                />

                Force Test Mode.
              </dd>
              <dt>Managers</dt>

              <dd>
                <div class="manager-list">
                  <template v-for="m in rulesetData.managers">
                    <a :href="'/~' + m.value">{{ m.value }}</a>
                    <div>
                      <template v-if="isEditable && m.type != 'SELF'"
                        ><a
                          :coachid="m.id"
                          href="#"
                          @click.prevent="removeManager(m)"
                          >Remove</a
                        ></template
                      >
                    </div>
                  </template>
                </div>

                <div v-if="isEditable" class="center">
                  <a href="#" @click.prevent="showAddManagerModal()"
                    >Add Manager</a
                  >
                </div>
              </dd>
            </dl>
          </template>
        </TitledPanel>
      </div>
    </div>
    <div
      class="panel content"
      id="mechanics"
      v-if="page == 'mechanics'"
      :key="serial"
    >
      <div class="col">
        <TitledPanel>
          <template #header>Mechanics</template>
          <template #content>
            <dl>
              <dt>Setup</dt>
              <dd name="options.clientOptions.wideZonePlayers">
                A maximum of
                <input
                  v-model="rulesetData.options.clientOptions.wideZonePlayers"
                  type="text"
                  size="2"
                />
                players may be set up in each widezone.
              </dd>
              <dd name="options.clientOptions.playersOnField">
                A maximum of
                <input
                  v-model="rulesetData.options.clientOptions.playersOnField"
                  type="text"
                  size="2"
                />
                players may be set up on the field.
              </dd>
              <dd name="options.clientOptions.playersOnLos">
                A minimum of
                <input
                  v-model="rulesetData.options.clientOptions.playersOnLos"
                  type="text"
                  size="2"
                />
                players must be set up on the line of scrimmage.
              </dd>
              <dt>Gameplay</dt>
              <dd>
                <Toggle
                  name="options.clientOptions.allowConcessions"
                  v-model="rulesetData.options.clientOptions.allowConcessions"
                />
                Allow Concessions.
              </dd>
              <dd>
                <Toggle
                  name="options.clientOptions.timeoutAllowed"
                  v-model="rulesetData.options.clientOptions.timeoutAllowed"
                />
                Allow Timeouts.
              </dd>
              <dd>
                <Toggle
                  name="options.clientOptions.argueTheCall"
                  v-model="rulesetData.options.clientOptions.argueTheCall"
                />
                Enable Argue the Call rule.
              </dd>
              <dd v-if="isVersion('2025')">
                <Toggle
                  name="options.clientOptions.allowSpecialActionsFromProne"
                  v-model="
                    rulesetData.options.clientOptions
                      .allowSpecialActionsFromProne
                  "
                />
                Allow special actions to be declared while prone.
              </dd>
              <dd v-if="isVersion('2025')">
                <Toggle
                  name="options.clientOptions.enableGettingEven"
                  v-model="rulesetData.options.clientOptions.enableGettingEven"
                />
                Enable Getting Even (Hatred) rule.
              </dd>
              <dd name="options.clientOptions.fouling">
                Fouling is
                <select v-model="rulesetData.options.clientOptions.fouling">
                  <option value="unmodified">unmodified</option>
                  <option value="armour">
                    done with +1 to the armour roll
                  </option>
                  <option value="outsidetz">
                    with +1 to injury if not interfered
                  </option></select
                >.
              </dd>
              <dt>Extras</dt>
              <dd>
                <Toggle
                  name="options.clientOptions.spikedBall"
                  v-model="rulesetData.options.clientOptions.spikedBall"
                />
                A spiked ball is used for play. Any failed pickup or catch roll
                results in the player being stabbed.
              </dd>

              <dt>Overtime</dt>
              <dd>
                <Toggle
                  name="options.clientOptions.overtime"
                  v-model="rulesetData.options.clientOptions.overtime"
                />
                Enable overtime.
              </dd>
              <dd name="options.clientOptions.overtimeGoldenGoal">
                <Toggle
                  name="options.clientOptions.overtimeGoldenGoal"
                  v-model="rulesetData.options.clientOptions.overtimeGoldenGoal"
                />
                Use Golden Goal for overtime.
              </dd>
              <dd name="options.clientOptions.overtimeKickOffResults">
                Use
                <select
                  v-model="
                    rulesetData.options.clientOptions.overtimeKickOffResults
                  "
                >
                  <option value="all">all</option>
                  <option value="blitz">blitz</option>
                  <option value="solidDefence">solid defence</option>
                  <option value="blitzOrSolidDefence">
                    blitz or solid defence (choice)
                  </option>
                  <option value="randomBlitzOrSolidDefence">
                    blitz or solid defence (random)
                  </option>
                </select>
                kickoff results for overtime.
              </dd>
              <dt>MVPs</dt>
              <dd name="options.clientOptions.mvpNominations">
                Nominate
                <input
                  v-model="rulesetData.options.clientOptions.mvpNominations"
                  type="text"
                  size="2"
                />
                players for MVP selection. Use 0 for random selection.
              </dd>

              <dt>Post-Game</dt>
              <dd>
                <Toggle
                  name="options.rulesetOptions.spirallingExpenses"
                  v-model="
                    rulesetData.options.rulesetOptions.spirallingExpenses
                  "
                />
                Enable Spiralling Expenses.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.spirallingBase"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.spirallingBase"
                  type="text"
                  size="3"
                />
                k TV start point.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.spirallingStep"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.spirallingStep"
                  type="text"
                  size="3"
                />
                k TV step for increased expenses.
              </dd>
              <dd
                style="padding-left: 25px; font-style: oblique; font-size: 11px"
              >
                Note that spiralling expenses interact with petty cash
                transferred. Take care with the BB2016 inducement option to
                transfer all gold to petty cash.
              </dd>
              <dd>
                <Toggle
                  name="options.rulesetOptions.expensiveMistakes"
                  v-model="rulesetData.options.rulesetOptions.expensiveMistakes"
                />
                Enable Expensive Mistakes.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.expensiveMistakesBase"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.expensiveMistakesBase
                  "
                  type="text"
                  size="1"
                />
                Base roll.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.expensiveMistakesStart"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.expensiveMistakesStart
                  "
                  type="text"
                  size="3"
                />
                k gold start point.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.expensiveMistakesStep"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.expensiveMistakesStep
                  "
                  type="text"
                  size="3"
                />
                k gold step for tiers.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.expensiveMistakesMax"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.expensiveMistakesMax
                  "
                  type="text"
                  size="3"
                />
                tier steps.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.expensiveMistakesMinors"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.expensiveMistakesMinors
                  "
                  type="text"
                  size="3"
                />
                minor incidents.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.expensiveMistakesMajors"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.expensiveMistakesMajors
                  "
                  type="text"
                  size="3"
                />
                major incidents.
              </dd>
              <dd
                style="padding-left: 25px; font-style: oblique; font-size: 11px"
              >
                Base - D6 + Min(MaxSteps, Floor((Treasury-Start) / StepSize))<br />
                1-5: Crisis Averted, <span id="emminorrange">6-7</span>: Minor
                incident, <span id="emmajorrange">8</span>: Major Incident,
                <span id="emcatrange">9+</span>: Catastrophe
              </dd>
            </dl>
          </template>
        </TitledPanel>
        <TitledPanel>
          <template #header>Visual Assists</template>
          <template #content>
            <dl>
              <dt>Tacklezones</dt>
              <dd>
                <Toggle
                  name="options.clientOptions.enableTacklezoneOverlays"
                  v-model="
                    rulesetData.options.clientOptions.enableTacklezoneOverlays
                  "
                />
                Allow tackle zone overlays.
              </dd>
            </dl>
          </template>
        </TitledPanel>
      </div>
    </div>

    <div
      class="panel content"
      id="seasons"
      v-if="page == 'seasons'"
      :key="serial"
    >
      <div class="col">
        <TitledPanel>
          <template #header>Seasons</template>
          <template #content>
            <dl>
              <dt>Core settings</dt>
              <dd>
                <Toggle
                  name="options.rulesetOptions.seasons"
                  v-model="rulesetData.options.rulesetOptions.seasons"
                />
                Enable Seasons.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonLength"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonLength"
                  type="text"
                  size="3"
                />
                games per season.
              </dd>
              <dt>Season Mechanics</dt>
              <dd>
                <Toggle
                  name="options.rulesetOptions.redraftInjuryRollsBeforeHire"
                  v-model="
                    rulesetData.options.rulesetOptions
                      .redraftInjuryRollsBeforeHire
                  "
                />
                Roll for injuries before the hire/fire phase.
              </dd>
              <dd>
                <Toggle
                  name="options.rulesetOptions.redraftStatsTurnIntoNiggles"
                  v-model="
                    rulesetData.options.rulesetOptions
                      .redraftStatsTurnIntoNiggles
                  "
                />
                Healed stat injuries on temporarily retired players turn into
                niggling injuries.
              </dd>

              <dt>Re-Drafting Budget</dt>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonGoldBase"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonGoldBase"
                  type="text"
                  size="3"
                />
                k gold base budget.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonGoldPerGame"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonGoldPerGame"
                  type="text"
                  size="3"
                />
                k gold per game.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonGoldPerWin"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonGoldPerWin"
                  type="text"
                  size="3"
                />
                k gold per win.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonGoldPerTie"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonGoldPerTie"
                  type="text"
                  size="3"
                />
                k gold per tie.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonGoldPerLoss"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonGoldPerLoss"
                  type="text"
                  size="3"
                />
                k gold per loss.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonRedraftRamp"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonRedraftRamp"
                  type="text"
                  size="3"
                />
                k Re-draft ramp. 0 to disable.
              </dd>
              <dd
                style="padding-left: 50px; font-style: oblique; font-size: 11px"
              >
                The Re-draft Ramp setting will limit the cap for the first few
                (total) games played for a team to Base + CapRamp * NumGames.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonCap"
              >
                <input
                  v-model="rulesetData.options.rulesetOptions.seasonCap"
                  type="text"
                  size="3"
                />
                k Cap. 0 to disable.
              </dd>

              <dt>Re-Hiring</dt>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonAgentFeeBase"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.seasonAgentFeeBase
                  "
                  type="text"
                  size="3"
                />
                k baseline agent fee.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonAgentFeePerSeason"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions.seasonAgentFeePerSeason
                  "
                  type="text"
                  size="3"
                />
                k cumulative gold per season agent fee.
              </dd>
              <dd
                style="padding-left: 25px"
                name="options.rulesetOptions.seasonAgentFeeSeasonModifier"
              >
                <input
                  v-model="
                    rulesetData.options.rulesetOptions
                      .seasonAgentFeeSeasonModifier
                  "
                  type="text"
                  size="3"
                />
                zero cumulative fee seasons.
              </dd>
              <dd
                style="padding-left: 50px; font-style: oblique; font-size: 11px"
              >
                The zero cumulative fee seasons setting is the number of seasons
                before the cumulative fee kicks in. 2 will make the first two
                seasons only add the baseline, and only start adding the
                cumulative fee starting after the third season.
              </dd>
            </dl>
          </template>
        </TitledPanel>
      </div>
    </div>

    <div
      class="panel content"
      id="teamsettings"
      v-if="page == 'teamsettings'"
      :key="serial"
    >
      <div class="col">
        <TitledPanel>
          <template #header>Team Creation</template>
          <template #content>
            <table class="settings" width="100%">
              <tr>
                <td width="25%">Advanced Team Creation</td>
                <td>
                  <Toggle
                    name="options.teamSettings.advancedTeamCreation"
                    v-model="
                      rulesetData.options.teamSettings.advancedTeamCreation
                    "
                  />
                  Enable advanced team creation. See <em>Tiers</em> section.
                </td>
              </tr>
              <tr>
                <td>Starting Treasury</td>
                <td name="options.teamSettings.startTreasury">
                  <input
                    v-model="rulesetData.options.teamSettings.startTreasury"
                    id="starttreasury"
                    type="text"
                  />
                </td>
              </tr>
            </table>
          </template>
        </TitledPanel>

        <TitledPanel>
          <template #header>Team Limits</template>
          <template #content>
            <table class="settings" width="100%">
              <tr>
                <td width="25%">Players on team</td>
                <td>
                  <span name="options.teamSettings.startPlayers">
                    <select
                      v-model="rulesetData.options.teamSettings.startPlayers"
                    >
                      <option v-for="i in range(1, 16)" :value="i">
                        {{ i }}
                      </option>
                    </select>
                  </span>
                  <span class="wide">to</span>
                  <span name="options.teamSettings.maxPlayers">
                    <select
                      v-model="rulesetData.options.teamSettings.maxPlayers"
                    >
                      <option v-for="i in range(1, 16)" :value="i">
                        {{ i }}
                      </option>
                    </select>
                  </span>
                </td>
              </tr>
              <tr>
                <td>Temporary retired players reserve a position slot</td>
                <td>
                  <Toggle
                    name="options.rulesetOptions.tempRetiredTakesPositionSlot"
                    v-model="
                      rulesetData.options.rulesetOptions
                        .tempRetiredTakesPositionSlot
                    "
                  />
                </td>
              </tr>
              <tr>
                <td>Fan Cost</td>
                <td name="options.teamSettings.dedicatedFanCost">
                  <input
                    v-model="rulesetData.options.teamSettings.dedicatedFanCost"
                    id="dedicatedFanCost"
                    type="text"
                  />
                </td>
              </tr>
              <tr>
                <td>Starting Fans</td>
                <td name="options.teamSettings.startFans">
                  <select v-model="rulesetData.options.teamSettings.startFans">
                    <option v-for="i in range(0, 9)" :value="i">
                      {{ i }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Fans on team</td>
                <td>
                  <span name="options.teamSettings.minStartFans">
                    <select
                      v-model="rulesetData.options.teamSettings.minStartFans"
                    >
                      <option v-for="i in range(0, 9)" :value="i">
                        {{ i }}
                      </option>
                    </select>
                  </span>
                  <span class="wide">to</span>
                  <span name="options.teamSettings.maxStartFans">
                    <select
                      v-model="rulesetData.options.teamSettings.maxStartFans"
                    >
                      <option v-for="i in range(0, 9)" :value="i">
                        {{ i }}
                      </option>
                    </select>
                  </span>
                </td>
              </tr>
              <tr>
                <td>Max Cheerleaders</td>
                <td name="options.teamSettings.maxCheerleaders">
                  <select
                    v-model="rulesetData.options.teamSettings.maxCheerleaders"
                  >
                    <option v-for="i in range(0, 16)" :value="i">
                      {{ i }}
                    </option>
                  </select>
                </td>
              </tr>
            </table>
          </template>
        </TitledPanel>
        <TitledPanel>
          <template #header>Progression</template>
          <template #content>
            <table class="settings" width="100%">
              <tr>
                <td width="25%">Team Progression</td>
                <td name="options.teamSettings.teamProgression">
                  <select
                    v-model="rulesetData.options.teamSettings.teamProgression"
                  >
                    <option value="standard">Standard</option>
                    <option value="none">No Progression</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Skill Progression</td>
                <td name="options.teamSettings.skillProgressionType">
                  <select
                    id="progressionselect"
                    v-model="
                      rulesetData.options.teamSettings.skillProgressionType
                    "
                  >
                    <option value="standard">BB2016</option>
                    <option value="bb2020">BB2020</option>
                    <option value="bb2025">BB2025</option>
                    <option value="none">None</option>
                    <option value="custom-spp">Custom SPP limits</option>
                    <option value="predetermined">Predetermined</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td id="ProgressionDescription"></td>
              </tr>
              <tr
                id="customspp"
                valign="top"
                v-if="
                  rulesetData.options.teamSettings.skillProgressionType ===
                  'custom-spp'
                "
              >
                <td>Custom SPPs per skill</td>
                <td name="options.teamSettings.sppLimits">
                  <input
                    v-model="rulesetData.options.teamSettings.sppLimits"
                    type="text"
                  /><br />
                  SPPs required for skills, comma separated.
                </td>
              </tr>
              <tr
                id="predeterminedSkills"
                valign="top"
                v-if="
                  rulesetData.options.teamSettings.skillProgressionType ===
                  'predetermined'
                "
              >
                <td>Skills</td>
                <td name="options.teamSettings.predeterminedSkills">
                  <input
                    v-model="
                      rulesetData.options.teamSettings.predeterminedSkills
                    "
                    type="text"
                  /><br />
                  Definition for skills. Comma separated list of game/skill type
                  pairs.
                </td>
              </tr>
              <tr
                id="skillsPerPlayer"
                valign="top"
                v-if="
                  rulesetData.options.teamSettings.skillProgressionType ===
                  'predetermined'
                "
              >
                <td>Skills per Player</td>
                <td name="options.teamSettings.skillsPerPlayer">
                  <input
                    v-model="rulesetData.options.teamSettings.skillsPerPlayer"
                    type="text"
                  />
                </td>
              </tr>
            </table>
          </template>
        </TitledPanel>
      </div>
    </div>

    <div
      class="panel content"
      id="skillsettings"
      v-if="page == 'skillsettings'"
      :key="serial"
    >
      <div :class="categories.length == 5 ? 'cols5' : 'cols3'">
        <template v-for="category in categories">
          <TitledPanel v-if="category.allowconfig">
            <template #header>{{ category.name }}</template>
            <template #content>
              <template v-for="skill in skills">
                <div
                  class="skill"
                  v-if="skill.option && skill.category == category.code"
                  :name="'options.skillOptions.' + skill.option"
                >
                  <Toggle
                    :id="'rulesetData.options.skillOptions.' + skill.option"
                    v-model="
                      $data['rulesetData']['options']['skillOptions'][
                        skill.option
                      ]
                    "
                  />

                  <label
                    :for="'rulesetData.options.skillOptions.' + skill.option"
                    >{{ skill.name }}</label
                  >
                </div>
              </template>
            </template>
          </TitledPanel>
        </template>
      </div>
      <TitledPanel>
        <template #header>Skill Settings</template>
        <template #content>
          <dl>
            <dt>Animal Savagery</dt>
            <dd>
              <Toggle
                name="options.clientOptions.animalSavageryLashOutEndsActivation"
                v-model="
                  rulesetData.options.clientOptions
                    .animalSavageryLashOutEndsActivation
                "
              />
              Animal Savagery lash-out ends activation.
            </dd>
            <dt>Ball &amp; Chain</dt>
            <dd>
              <Toggle
                name="options.clientOptions.allowBallAndChainReRoll"
                v-model="
                  rulesetData.options.clientOptions.allowBallAndChainReRoll
                "
              />
              Ball &amp; Chain may use team re-rolls and pro to re-roll
              direction rolls.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.allowSpecialBlocksWithBallAndChain"
                v-model="
                  rulesetData.options.clientOptions
                    .allowSpecialBlocksWithBallAndChain
                "
              />
              Ball &amp; Chain may use Chainsaw, Stab, or Vomit instead of a
              regular block.
            </dd>
            <dt>Bombardier</dt>
            <dd>
              <Toggle
                name="options.clientOptions.bomberPlacedProneIgnoresTurnover"
                v-model="
                  rulesetData.options.clientOptions
                    .bomberPlacedProneIgnoresTurnover
                "
              />
              Bomber placed prone is not a turnover.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.bombUsesMb"
                v-model="rulesetData.options.clientOptions.bombUsesMb"
              />
              Bomb hits with mighty blow.
            </dd>
            <dd v-if="isVersion('2025')">
              <Toggle
                name="options.clientOptions.bombBouncesOnEmptySquares"
                v-model="
                  rulesetData.options.clientOptions.bombBouncesOnEmptySquares
                "
              />
              Bomb bouces on empty squares.
            </dd>

            <dt v-if="isVersion('2020', '2025')">Brawler</dt>
            <dd v-if="isVersion('2020', '2025')">
              <Toggle
                name="options.clientOptions.allowBrawlerOnBothBlocks"
                v-model="
                  rulesetData.options.clientOptions.allowBrawlerOnBothBlocks
                "
              />
              Brawler can be used once per block during a turn.
            </dd>
            <dt>Chainsaw</dt>
            Chainsaw causes turnover on
            <span name="options.clientOptions.chainsawTurnover">
              <select
                v-model="rulesetData.options.clientOptions.chainsawTurnover"
              >
                <option value="never">never</option>
                <option value="kickback">kickback</option>
                <option value="kickbackAvBreak">kickback AV break</option>
                <option value="allAvBreaks">all AV breaks</option>
              </select>
            </span>
            armour breaks.
            <dt>Claw</dt>
            <dd>
              <Toggle
                name="options.clientOptions.clawNoStack"
                v-model="rulesetData.options.clientOptions.clawNoStack"
              />
              Claw does not stack with other skills that modify armour rolls.
            </dd>
            <dt>Diving Tackle</dt>
            <dd>
              <Toggle
                name="options.clientOptions.divingTackleLeavingTzOnly"
                v-model="
                  rulesetData.options.clientOptions.divingTackleLeavingTzOnly
                "
              />
              Only allow diving tackle when leaving Tackle Zone.
            </dd>
            <dt>Kick</dt>
            <dd>
              <Toggle
                name="options.clientOptions.askForKickAfterRoll"
                v-model="rulesetData.options.clientOptions.askForKickAfterRoll"
              />
              Ask for kick use after roll.
            </dd>
            <dt>Mighty Blow</dt>
            <dd>
              <Toggle
                name="options.clientOptions.mbStacksAgainstChainsaw"
                v-model="
                  rulesetData.options.clientOptions.mbStacksAgainstChainsaw
                "
              />
              Mighty Blow stacks against Chainsaw.
            </dd>
            <dt>Piling On</dt>
            <dd name="options.clientOptions.pilingOn">
              Allow coach to reroll
              <select v-model="rulesetData.options.clientOptions.pilingOn">
                <option value="both">both</option>
                <option value="armour">armour</option>
                <option value="injury">injury</option>
              </select>
              rolls.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.pilingOnNoStack"
                v-model="rulesetData.options.clientOptions.pilingOnNoStack"
              />
              Piling On does not stack with other skills that modify armour or
              injury rolls.
            </dd>
            <dd name="options.clientOptions.pilingOnKoDouble">
              <input
                v-model="rulesetData.options.clientOptions.pilingOnKoDouble"
                type="checkbox"
              />
              Piling On player is knocked out when rolling a double on armour or
              injury rolls.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.pilingOnUsesATeamReroll"
                v-model="
                  rulesetData.options.clientOptions.pilingOnUsesATeamReroll
                "
              />
              Piling On requires a Team Reroll.
            </dd>
            <dt>Right Stuff</dt>
            <dd>
              <Toggle
                name="options.clientOptions.rightStuffCancelTackle"
                v-model="
                  rulesetData.options.clientOptions.rightStuffCancelTackle
                "
              />
              Right Stuff prevents Tackle skill when blocked.
            </dd>
            <dt>Throw Team-mate</dt>
            <dd>
              <Toggle
                name="options.clientOptions.endTurnWhenHittingAnyPlayerWithTtm"
                v-model="
                  rulesetData.options.clientOptions
                    .endTurnWhenHittingAnyPlayerWithTtm
                "
              />
              Cause a turnover if an opponent player is hit by a thrown
              team-mate.
            </dd>
            <dd
              style="padding-left: 25px; font-style: oblique; font-size: 11px"
            >
              Hitting team-mates always causes a turnover.
            </dd>
            <dt>Sneaky Git</dt>
            <dd>
              <Toggle
                name="options.clientOptions.sneakyAsFoul"
                v-model="rulesetData.options.clientOptions.sneakyAsFoul"
              />
              Sneaky Git functions as Guard on foul assists.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.sneakyBanToKo"
                v-model="rulesetData.options.clientOptions.sneakyBanToKo"
              />
              Banned Sneaky Git players are sent to the KO box instead.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.sneakyGitCanMoveAfterFoul"
                v-model="
                  rulesetData.options.clientOptions.sneakyGitCanMoveAfterFoul
                "
              />
              Sneaky Git can move after fouling.
            </dd>
            <dt>Stand Firm</dt>
            <dd>
              <Toggle
                name="options.clientOptions.standFirmNoFall"
                v-model="rulesetData.options.clientOptions.standFirmNoFall"
              />
              Failing to dodge ends the player\'s turn instead of falling over.
              Does not cause a turnover.
            </dd>
            <dt>Swoop</dt>
            <dd name="options.clientOptions.swoopDistance">
              Swoop distance:
              <input
                v-model="rulesetData.options.clientOptions.swoopDistance"
                type="text"
                size="2"
              />
            </dd>
            <dd
              style="padding-left: 25px; font-style: oblique; font-size: 11px"
            >
              Setting to zero makes the swoop distance D3 as per BB2020 rules.
            </dd>
          </dl>
        </template>
      </TitledPanel>

      <TitledPanel v-if="isVersion('2020')">
        <template #header>Options</template>
        <template #content>
          <dl>
            <dt>Plague Ridden</dt>
            <dd>
              Raised position
              <div id="plagueRiddenControlPanel">
                <span name="options.rulesetOptions.plagueRiddenRoster">
                  <select
                    v-model="
                      rulesetData.options.rulesetOptions.plagueRiddenRoster
                    "
                    id="plagueRiddenRosterSelect"
                  >
                    <option value="0">Select Roster</option>
                  </select>
                </span>
                <span name="options.rulesetOptions.plagueRiddenPosition">
                  <select
                    v-model="
                      rulesetData.options.rulesetOptions.plagueRiddenPosition
                    "
                    id="plagueRiddenPositionSelect"
                  >
                    <option value="0">Select Position</option>
                  </select>
                </span>
              </div>
            </dd>
          </dl>
        </template>
      </TitledPanel>
    </div>

    <div
      class="panel content"
      id="inducements"
      v-if="page == 'inducements'"
      :key="serial"
    >
      <TitledPanel>
        <template #header>Inducements</template>
        <template #content>
          <dl class="inducementsettings">
            <dt>General Settings</dt>
            <dd name="options.clientOptions.inducementGold">
              <input
                v-model="rulesetData.options.clientOptions.inducementGold"
                type="text"
                size="8"
              />
              extra gold is given to each coach for purchasing inducements.
            </dd>
            <dd v-if="isVersion('2016')" name="options.clientOptions.cardGold">
              <input
                v-model="rulesetData.options.clientOptions.cardGold"
                type="text"
                size="8"
              />
              extra gold is given to each coach for purchasing cards.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.pettyCashAffectsTv"
                v-model="rulesetData.options.clientOptions.pettyCashAffectsTv"
              />
              Petty cash affects TV.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.forceTreasuryToPettyCash"
                v-model="
                  rulesetData.options.clientOptions.forceTreasuryToPettyCash
                "
              />
              Treasury is automatically transferred to petty cash.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.inducementsAllowSpendingTreasuryOnEqualCTV"
                v-model="
                  rulesetData.options.clientOptions
                    .inducementsAllowSpendingTreasuryOnEqualCTV
                "
              />

              Allow spending treasury on inducements if CTV is equal.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.inducementsAlwaysUseTreasury"
                v-model="
                  rulesetData.options.clientOptions.inducementsAlwaysUseTreasury
                "
              />
              Always use treasury for inducements (disables petty cash).
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.allowStarOnBothTeams"
                v-model="rulesetData.options.clientOptions.allowStarOnBothTeams"
              />
              Allow the same star player to play on both teams.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.megaStarsAvailable"
                v-model="rulesetData.options.clientOptions.megaStarsAvailable"
              />
              Allow mega-stars to be induced.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.inducementsAllowOverdogSpending"
                v-model="
                  rulesetData.options.clientOptions
                    .inducementsAllowOverdogSpending
                "
              />
              Allow overdog spending.
            </dd>
            <dd>
              <Toggle
                name="options.clientOptions.inducementsAllowUnderdogSpending"
                v-model="
                  rulesetData.options.clientOptions
                    .inducementsAllowUnderdogSpending
                "
              />
              Give the underdog an extra 50k gold to spend in inducements.
            </dd>

            <dt>Biased Ref</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementBiasedRefMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementBiasedRefMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementBiasedRefCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementBiasedRefCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementBiasedRefReducedMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementBiasedRefReducedMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementBiasedRefReducedCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementBiasedRefReducedCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each for teams with special rule.
            </dd>

            <dt>Blitzer's Best Kegs</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementKegsMax"
              >
                <select
                  v-model="rulesetData.options.clientOptions.inducementKegsMax"
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementKegsCost">
                <input
                  v-model="rulesetData.options.clientOptions.inducementKegsCost"
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Bribes</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementBribesMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementBribesMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementBribesCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementBribesCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementBribesReducedMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementBribesReducedMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementBribesReducedCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementBribesReducedCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each for teams with special rule.
            </dd>

            <dt>Extra Team Training</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementExtraTrainingMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementExtraTrainingMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementExtraTrainingCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementExtraTrainingCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Halfling Master Chef</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementChefsMax"
              >
                <select
                  v-model="rulesetData.options.clientOptions.inducementChefsMax"
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementChefsCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementChefsCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementChefsReducedMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementChefsReducedMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementChefsReducedCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementChefsReducedCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each for teams with special rule.
            </dd>

            <dt v-if="isVersion('2016')">Igor</dt>
            <dd v-if="isVersion('2016')">
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementIgorsMax"
              >
                <select
                  v-model="rulesetData.options.clientOptions.inducementIgorsMax"
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementIgorsCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementIgorsCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Mercenary Players</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementMercenariesMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementMercenariesMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementMercenariesExtraCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementMercenariesExtraCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              <span class="wide">extra gold each,</span><br /><span
                class="wide"
              >
                and</span
              >
              <span
                class="mleft"
                name="options.clientOptions.inducementMercenariesSkillCost"
              >
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementMercenariesSkillCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold for a skill.
            </dd>

            <dt v-if="isVersion('2020', '2025')">Mortuary Assistant</dt>
            <dd v-if="isVersion('2020', '2025')">
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementMortuaryAssistantsMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementMortuaryAssistantsMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span
                name="options.clientOptions.inducementMortuaryAssistantsCost"
              >
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementMortuaryAssistantsCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Part-time Assistant Coaches</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementPartTimeCoachMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementPartTimeCoachMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">up to a total maximum of</span>
              <span
                name="options.clientOptions.inducementPartTimeCoachTotalMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementPartTimeCoachTotalMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <br /><span class="wide">at</span>
              <span name="options.clientOptions.inducementPartTimeCoachCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementPartTimeCoachCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>
          </dl>

          <dl class="inducementsettings">
            <dt>Plague Doctor</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementPlagueDoctorsMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementPlagueDoctorsMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementPlagueDoctorsCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementPlagueDoctorsCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt v-if="isVersion('2020', '2025')">Prayers to Nuffle</dt>
            <dd v-if="isVersion('2020', '2025')">
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementPrayersMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementPrayersMax
                  "
                >
                  <option value="0">No Limit</option>
                  <option v-for="i in range(1, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementPrayersCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementPrayersCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>
            <dd
              v-if="isVersion('2020')"
              name="options.clientOptions.inducementPrayersUseLeagueTable"
            >
              Use
              <select
                v-model="
                  rulesetData.options.clientOptions
                    .inducementPrayersUseLeagueTable
                "
              >
                <option value="false">Exhibition</option>
                <option value="true">League</option>
              </select>
              table for Prayers to Nuffle.
            </dd>
            <dd v-if="isVersion('2020', '2025')">
              <Toggle
                name="options.clientOptions.inducementPrayersAvailableForUnderdog"
                v-model="
                  rulesetData.options.clientOptions
                    .inducementPrayersAvailableForUnderdog
                "
              />
              Grant Prayers to Nuffle to underdog team during inducement phase.
            </dd>

            <dt>Riotous Rookies</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementRiotousRookiesMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementRiotousRookiesMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementRiotousRookiesCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementRiotousRookiesCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt v-if="isVersion('2016')">Special Play Cards</dt>
            <dd v-if="isVersion('2016')" name="options.clientOptions.maxCards">
              Maximum number of cards for each coach is
              <input
                v-model="rulesetData.options.clientOptions.maxCards"
                type="text"
                size="2"
              />.
            </dd>
            <dd
              v-if="isVersion('2016')"
              name="options.clientOptions.cardsSpecialPlayCost"
            >
              <input
                v-model="rulesetData.options.clientOptions.cardsSpecialPlayCost"
                type="text"
                size="8"
              />
              gold per Special Play Card.
            </dd>

            <dt>Star Players</dt>

            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementStarsMax"
              >
                <select
                  v-model="rulesetData.options.clientOptions.inducementStarsMax"
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              Star Players can be hired.
            </dd>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementStaffMax"
              >
                <select
                  v-model="rulesetData.options.clientOptions.inducementStaffMax"
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              Infamous Coaching Staff can be hired.
            </dd>

            <dt v-if="isVersion('2025')">Team Mascot</dt>
            <dd v-if="isVersion('2025')">
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementMascotMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementMascotMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementMascotCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementMascotCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Temp Agency Cheerleaders</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementTempCheerleaderMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementTempCheerleaderMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">up to a total maximum of</span>
              <span
                name="options.clientOptions.inducementTempCheerleaderTotalMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementTempCheerleaderTotalMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <br /><span class="wide">at</span>
              <span name="options.clientOptions.inducementTempCheerleaderCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions
                      .inducementTempCheerleaderCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Wandering Apothecary</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementAposMax"
              >
                <select
                  v-model="rulesetData.options.clientOptions.inducementAposMax"
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementAposCost">
                <input
                  v-model="rulesetData.options.clientOptions.inducementAposCost"
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Weather Mage</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementWeatherMageMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementWeatherMageMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementWeatherMageCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementWeatherMageCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>

            <dt>Wizard: Sports Wizard</dt>
            <dd>
              Max
              <span
                class="mleft"
                name="options.clientOptions.inducementWizardsMax"
              >
                <select
                  v-model="
                    rulesetData.options.clientOptions.inducementWizardsMax
                  "
                >
                  <option v-for="i in range(0, 16)">{{ i }}</option>
                </select>
              </span>
              <span class="wide">at</span>
              <span name="options.clientOptions.inducementWizardsCost">
                <input
                  v-model="
                    rulesetData.options.clientOptions.inducementWizardsCost
                  "
                  type="text"
                  size="8"
                />
              </span>
              gold each.
            </dd>
          </dl>
        </template>
      </TitledPanel>
    </div>

    <div
      class="panel content"
      id="rosters"
      v-if="page == 'rosters'"
      :key="serial"
    >
      <div class="col">
        <TitledPanel>
          <template #header>Enabled Rosters</template>
          <template #content>
            <dl>
              <dd>
                <table border="0" id="promotedrosters">
                  <tr v-for="(roster, id) in promoted">
                    <td>
                      <Toggle :name="'selected.' + id" v-model="selected[id]" />
                      {{ roster }}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Toggle
                        name="selected.custom"
                        v-model="selected['custom']"
                      />
                      Custom - Enable this to use custom rosters outside the
                      preset ones from above.
                    </td>
                  </tr>
                </table>
              </dd>
            </dl>
          </template>
        </TitledPanel>
      </div>
      <div class="col">
        <TitledPanel>
          <template #header>Rosters</template>
          <template #content>
            <table class="rostertable">
              <tr>
                <th width="10%">Source</th>
                <th width="10%">Enabled</th>
                <th colspan="2">Name</th>
              </tr>
              <template v-for="roster in rosters">
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
            </table>
          </template>
        </TitledPanel>
      </div>
    </div>

    <div class="panel content" id="tiers" v-if="page == 'tiers'" :key="serial">
      <div class="col">
        <TitledPanel>
          <template #header>Tiers</template>
          <template #content>
            <template v-for="tier in tierData">
              <div class="tier">Tier {{ tier.name }}</div>
              <div class="roster" v-for="roster in tier.rosters">
                {{ rosterCache[roster].value }}
              </div>
            </template>
          </template>
        </TitledPanel>
      </div>
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
        type="text"
        placeholder="Search for coach"
        v-model="managerSearch"
      />

      <div class="search-results">
        <template v-for="coach in managerSearchResult">
          <div @click="addManager(coach)">
            {{ coach.name }}
          </div>
        </template>
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
  {{ currentChanges }}
</template>

<style scoped>
@import "./ruleset.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref, Watch } from "vue-facing-decorator";
import FumbblApi from "@api/fumbbl";

import {
  PageHeader,
  TitledPanel,
  Modal,
  Toggle,
} from "@components/fumbblcomponents";

@Component({
  components: {
    PageHeader,
    TitledPanel,
    Modal,
    Toggle,
  },
})
class Ruleset extends Vue {
  public fumbblApi: FumbblApi = new FumbblApi();
  public navItems: any = [
    { label: "Ruleset Options", page: "rulesetoptions" },
    { label: "Seasons", page: "seasons" },
    { label: "Mechanics", page: "mechanics" },
    { label: "Team Settings", page: "teamsettings" },
    { label: "Skills", page: "skillsettings" },
    { label: "Inducements", page: "inducements" },
    { label: "Rosters", page: "rosters" },
    { label: "Tiers", page: "tiers" },
  ];
  public page: string = "";

  @Ref
  public pageElement: any;

  declare public $data: any;

  public loading: boolean = true;
  public serial: number = 0;
  public isEditable: boolean = false;
  public rulesetLoaded: boolean = false;
  public rulesetData: any = {
    options: { rulesetOptions: {}, teamSettings: {}, clientOptions: {} },
  };
  public savedData: any = {
    options: { rulesetOptions: {}, teamSettings: {}, clientOptions: {} },
  };
  public tierData: any = {};
  public categories: any[] = [];
  public skills: any[] = [];
  public promoted: any[] = [];
  public selected: any = {};
  public savedSelected: any = {};
  public rosters: any = [];
  public savedRosters: any = [];

  public modalAddManager: boolean = false;
  public managerSearch: string = "";
  public managerSearchResult: any[] = [];

  public modalConfirmRemove: boolean = false;
  public rosterToBeRemoved: any = {};

  public rosterCache: any = {};
  public savedRosterCache: any = {};

  public get importedRosters(): string[] {
    let result = [];
    for (var x in this.selected) {
      if (this.selected[x] == "Yes") {
        result.push(x);
      }
    }
    return result;
  }

  public get currentChanges(): Array<{ key: string; val: any }> {
    const diff = this.diff(this.rulesetData, this.savedData) ?? {};

    delete diff.rosters;

    const changes = this.flattenChanges(diff);

    if (!this.shallowEqual(this.savedSelected, this.selected)) {
      const availableRosters = Object.entries(this.selected)
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
        .join(",");

      changes.push({
        key: "options.rosterSettings.availableRosters",
        val: availableRosters,
      });
    }

    for (let index in this.rosters) {
      var a = this.rosters[index];
      var b = this.savedRosterCache[a.id];

      if (a.tier != b.tier) {
        changes.push({
          key: "roster." + a.id + ".tier",
          val: a.tier,
        });
      }
      if (a.enabled != b.enabled) {
        changes.push({
          key: "roster." + a.id + ".enabled",
          val: a.enabled,
        });
      }
    }

    return changes;
  }

  public async created() {
    const that = this;
    window.onpopstate = function (ev) {
      if (ev.state && ev.state.page) {
        that.setPage(ev.state.page, false);
      }
    };
  }

  public async mounted() {
    await this.loadRuleset(2014);
    this.setPage("rulesetoptions");
  }

  public showAddManagerModal() {
    this.modalAddManager = true;
  }

  public hideAddManagerModal() {
    this.modalAddManager = false;
  }

  public range(start: number, end: number): number[] {
    let result = Array.from({ length: end - start + 1 }, (_, i) => i + start);
    return result;
  }

  public reloadPage() {
    this.setPage(this.page);
  }

  public setPage(page: string, storeHistory: boolean = true) {
    if (this.fumbblApi === undefined) {
      return;
    }

    if (storeHistory && page != this.page) {
      window.history.pushState({ page: page }, "");
    }

    this.page = page;

    switch (page) {
    }

    this.$nextTick(() => this.updateDirtyIndicators());
  }

  public async loadRuleset(id: number) {
    this.loading = true;

    const ruleset = await this.fumbblApi.Ruleset.getRuleset(id);
    if (ruleset) {
      this.rosters = [];
      this.rulesetData = ruleset;
      this.savedData = structuredClone(ruleset);
      this.savedSelected = [];
      this.savedRosters = [];

      const categories = await this.fumbblApi.Skill.getCategories(
        ruleset.options.rulesetOptions.version,
      );
      this.categories = categories;

      const skills = await this.fumbblApi.Skill.list(
        ruleset.options.rulesetOptions.version,
      );
      this.skills = skills;

      const promoted = await this.fumbblApi.Ruleset.promoted(
        ruleset.options.rulesetOptions.version,
      );
      this.promoted = promoted;
      for (let p in promoted) {
        this.selected[String(p)] = this.savedSelected[String(p)] = false;
      }
      this.selected["custom"] = this.savedSelected["custom"] = false;

      const rosters =
        this.rulesetData.options.rosterSettings.availableRosters.split(",");
      for (let p in rosters) {
        const roster = rosters[p];
        this.selected[roster] = true;
        this.savedSelected[roster] = true;
        if (roster != "custom" && roster) {
          const externalRuleset =
            await this.fumbblApi.Ruleset.getRuleset(roster);

          for (let r in externalRuleset.rosters) {
            const externalRoster = externalRuleset.rosters[r];
            externalRoster.external = true;
            externalRoster.type = "PRE";
            if (!this.rosters.find((r: any) => r.id == externalRoster.id)) {
              this.rosters.push(externalRoster);
              this.savedRosters.push(structuredClone(externalRoster));
            }
          }
        } else if (this.savedSelected["custom"]) {
          for (let r in this.rulesetData.rosters) {
            const customRoster = this.rulesetData.rosters[r];
            customRoster.external = customRoster.type == "EXT";
            const ruleset = customRoster.ruleset;

            if (
              this.savedSelected[ruleset] === false &&
              ruleset != this.rulesetData.id
            ) {
              continue;
            }
            if (
              this.savedSelected[ruleset] === undefined &&
              ruleset != this.rulesetData.id
            ) {
              customRoster.type = "EXT";
              customRoster.external = true;
            }
            this.rosters = this.rosters.filter(
              (r: any) => r.id != customRoster.id,
            );
            this.savedRosters = this.savedRosters.filter(
              (r: any) => r.id != customRoster.id,
            );
            this.rosters.push(customRoster);
            this.savedRosters.push(this.savedData.rosters[r]);
          }
        }
      }
      this.rosters.sort((a: any, b: any) => a.value.localeCompare(b.value));
      this.savedRosters.sort((a: any, b: any) =>
        a.value.localeCompare(b.value),
      );

      if (!this.rulesetData.tiers) {
        this.tierData = {};

        for (let r in this.rosters) {
          const roster = this.rosters[r];
          if (!this.tierData[roster.tier]) {
            this.tierData[roster.tier] = {
              name: String(roster.tier),
              rosters: [],
            };
          }
          this.rosterCache[roster.id] = roster;
          this.tierData[roster.tier].rosters.push(roster.id);
        }
      }

      for (let r in this.savedRosters) {
        let roster = this.savedRosters[r];
        if (roster.enabled === undefined) {
          roster.enabled = true;
        }
        this.savedRosterCache[roster.id] = roster;
      }

      this.isEditable = false;
      for (let m in ruleset.managers) {
        if (ruleset.managers[m].type === "SELF") {
          this.isEditable = true;
          break;
        }
      }

      this.rulesetLoaded = true;
      this.serial++;
      this.loading = false;
    }
  }

  public async saveChanges() {
    if (this.currentChanges.length == 0) {
      return;
    }

    this.loading = true;
    try {
      await this.fumbblApi.Ruleset.save(
        this.rulesetData.id,
        this.currentChanges,
      );
    } catch (e) {}
    await this.loadRuleset(this.rulesetData.id);
  }

  private searchTimeout: number | undefined;
  @Watch("managerSearch")
  public doManagerSearch() {
    clearTimeout(this.searchTimeout);
    if (this.managerSearch.length > 2) {
      this.searchTimeout = window.setTimeout(async () => {
        var result: any = await this.fumbblApi.Coach.search(this.managerSearch);
        this.managerSearchResult = result;
      }, 300);
    }
  }

  public async addManager(coach: any) {
    this.managerSearch = "";
    this.hideAddManagerModal();

    await this.fumbblApi.Ruleset.addManager(this.rulesetData.id, coach.id);
    await this.loadRuleset(this.rulesetData.id);
  }

  public async removeManager(coach: any) {
    await this.fumbblApi.Ruleset.removeManager(this.rulesetData.id, coach.id);
    await this.loadRuleset(this.rulesetData.id);
  }

  public async addRoster(rosterId: number) {
    await this.fumbblApi.Roster.add(this.rulesetData.id, rosterId);
    await this.loadRuleset(this.rulesetData.id);
  }

  public async confirmRemoveRoster(roster: any) {
    this.rosterToBeRemoved = roster;
    this.modalConfirmRemove = true;
  }

  public async removeRoster() {
    this.modalConfirmRemove = false;
    await this.fumbblApi.Roster.remove(
      this.rulesetData.id,
      this.rosterToBeRemoved.id,
    );
    this.rosters = this.rosters.filter(
      (r: any) => r.id != this.rosterToBeRemoved.id,
    );
  }

  public async cloneLocal(rosterId: number) {
    const roster = this.rosters.find((r: any) => r.id == rosterId);
    if (roster) {
      const newId = await this.fumbblApi.Roster.cloneLocal(
        this.rulesetData.id,
        rosterId,
      );
      const newRoster = {
        id: parseInt(newId),
        external: false,
        ruleset: this.rulesetData.id,
        value: roster.value,
        tier: roster.tier,
        enabled: true,
      };
      const newRosterClone = structuredClone(newRoster);
      this.rosters.push(newRoster);
      this.savedRosters.push(newRosterClone);
      this.rosterCache[newRoster.id] = newRoster;
      this.savedRosterCache[newRosterClone.id] = newRosterClone;

      this.rosters.sort((a: any, b: any) => a.value.localeCompare(b.value));
      this.savedRosters.sort((a: any, b: any) =>
        a.value.localeCompare(b.value),
      );
      this.serial++;
    }
  }

  public isVersion(...versions: any[]): boolean {
    return versions.includes(this.rulesetData.options.rulesetOptions.version);
  }

  @Watch("rulesetData", { deep: true })
  @Watch("selected", { deep: true })
  @Watch("rosters", { deep: true })
  onRulesetChanged() {
    this.$nextTick(() => this.updateDirtyIndicators());
  }

  private updateDirtyIndicators() {
    const root = this.pageElement as HTMLElement;

    root.querySelectorAll<HTMLElement>("[name]").forEach((el) => {
      const path = el.getAttribute("name");
      if (!path) return;

      if (path.startsWith("selected.")) {
        const current = this.getValue(this, path);
        const original = this.getValue(
          this,
          path.replace("selected.", "savedSelected."),
        );
        el.classList.toggle("changed", current != original);
      } else if (path.startsWith("roster.")) {
        const current = this.getValue(
          this,
          path.replace(/roster\.(\d+)./, "rosterCache.$1."),
        );
        const original = this.getValue(
          this,
          path.replace(/roster\.(\d+)./, "savedRosterCache.$1."),
        );
        el.classList.toggle("changed", current != original);
      } else {
        const current = this.getValue(this.rulesetData, path);
        const original = this.getValue(this.savedData, path);
        el.classList.toggle("changed", current != original);
      }
    });
  }

  private getValue(obj: any, path: string) {
    return path.split(".").reduce((o, p) => o?.[p], obj);
  }

  private diff(current: any, original: any): any {
    // Primitive values
    if (
      current === null ||
      original === null ||
      typeof current !== "object" ||
      typeof original !== "object"
    ) {
      return current == original ? undefined : current;
    }

    // Arrays - replace the whole array if changed
    if (Array.isArray(current)) {
      return JSON.stringify(current) == JSON.stringify(original)
        ? undefined
        : current;
    }

    const result: Record<string, any> = {};

    for (const key of Object.keys(current)) {
      const d = this.diff(current[key], original[key]);

      if (d !== undefined) {
        result[key] = d;
      }
    }

    return Object.keys(result).length ? result : undefined;
  }

  private flattenChanges(
    obj: any,
    prefix = "",
  ): Array<{ key: string; val: any }> {
    const changes: Array<{ key: string; val: any }> = [];

    for (const key of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        changes.push(...this.flattenChanges(value, path));
      } else {
        const finalKey = path.startsWith("options.") ? path : `ruleset.${path}`;

        changes.push({
          key: finalKey,
          val: value,
        });
      }
    }

    return changes;
  }

  private shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    return keysA.every((key) => a[key] === b[key]);
  }
}

export default toNative(Ruleset);
</script>
