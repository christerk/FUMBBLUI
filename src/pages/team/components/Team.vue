<template>
  <div class="team" v-if="dataPropertiesInitialized">
    <div class="teamheader">
      <div class="rosterlogo quickstats">
        <div class="division">{{ teamManagementSettings.rosterName }}</div>
        <div class="infobox logo">
          <img
            class="logoimage"
            :src="`https://fumbbl.com/i/${teamManagementSettings.logoIdLarge}`"
            :alt="`Roster logo for ${teamManagementSettings.rosterName}`"
            :title="`Roster logo for ${teamManagementSettings.rosterName}`"
          />
        </div>
        <div class="infobox">
          <div class="title">TV</div>
          <div class="info">{{ teamValue / 1000 }}k</div>
        </div>
        <div class="infobox">
          <div class="title">CTV</div>
          <div class="info">{{ currentTeamValue / 1000 }}k</div>
        </div>
      </div>
      <div class="teamheadermain">
        <div class="teamheadermaincontent">
          <editteamname
            ref="nameEdit"
            :fumbbl-api="fumbblApi"
            :team-name="team.getName()"
            :can-edit="accessControl.canCreate()"
            :can-admin="accessControl.canRenameTeam()"
            @edit="handleEditTeamName"
            @begin="handleBeginEditTeamName"
            @cancel="handleCancelEditTeamName"
          ></editteamname>
          <div class="rosterinfo" style="margin-top: 0.5em">
            <div class="status">{{ team.getTeamStatus().displayName }}</div>
          </div>
          <ul class="teamnav">
            <button
              v-if="
                team.getTeamStatus().isPostMatch() &&
                accessControl.canReadyTeam()
              "
              class="menu"
              @click="interceptReadyToPlay"
            >
              Complete
            </button>

            <button
              v-if="
                team.getTeamStatus().isReadyForTournament() &&
                accessControl.canReadyTeam()
              "
              class="menu"
              @click="interceptSkipTournament"
            >
              Play on
            </button>

            <button
              v-else-if="team.getTeamStatus().isNew()"
              @click="activateTeam"
              class="menu"
            >Create</button>


            <li class="menu">
              <a
                href="#"
                v-if="accessControl.canEdit()"
                @click.prevent="enableShowHireRookies()"
                >Hire Players</a
              >
            </li>
            <li
              v-if="accessControl.canShowAdminMenu()"
              class="menu"
              @mouseenter="menuShow('admin')"
              @mouseleave="menuHide()"
            >
              <a href="#">Admin</a>
              <ul class="submenu" v-show="mainMenuShow === 'admin'">
                <li v-if="accessControl.canMagicFixTeam()">
                  <a href="#" @click.prevent="magicFixTeam()">Magic Fix</a>
                </li>
                <li v-if="accessControl.canUnreadyTeam()">
                  <a href="#" @click.prevent="unreadyTeam()">Unready</a>
                </li>
                <li v-if="accessControl.canRenameTeam()">
                  <a href="#" @click.prevent="renameTeam()">Rename</a>
                </li>
                <li v-if="accessControl.canSetTreasury()">
                  <a href="#" @click.prevent="setTreasury()">Set Treasury</a>
                </li>
                <li v-if="accessControl.canSetDedicatedFans()">
                  <a href="#" @click.prevent="setDedicatedFans()">Set Fans</a>
                </li>
                <li v-if="accessControl.canRenameAllPlayers()">
                  <a href="#" @click.prevent="renameAllPlayers()">Rename Players</a>
                </li>
              </ul>
            </li>
            <div class="spacer"></div>
            <li
              v-if="accessControl.canEditBio()"
              class="menu"
              @mouseenter="menuShow('misc')"
              @mouseleave="menuHide()"
            >
              <a @click.prevent="menuToggle('misc')" href="#"
                >Edit
                <img
                  src="https://fumbbl.com/FUMBBL/Images/Icons/disclosure.png"
              /></a>
              <ul class="submenu" v-show="mainMenuShow === 'misc'">
                <li>
                  <a
                    :href="`https://fumbbl.com/p/gallery3?team=${team.getId()}`"
                    >Change Image</a
                  >
                </li>
                <li>
                  <a
                    :href="`https://fumbbl.com/p/team?op=editbio&amp;team_id=${team.getId()}`"
                    >Edit Bio</a
                  >
                </li>
                <li v-if="accessControl.canRetireTeam()">
                  <a href="#" @click.prevent="retireTeamModal?.show()">Retire Team</a>
                </li>
                <li v-if="accessControl.canCreate()">
                  <a href="#" @click.prevent="deleteTeamModal?.show()">Delete Team</a>
                </li>
              </ul>
            </li>
            <li
              v-else-if="accessControl.canReport()"
              class="menu"
              @mouseenter="menuShow('misc')"
              @mouseleave="menuHide()"
            >
              <a @click.prevent="menuToggle('misc')" href="#"
                >Report
                <img
                  src="https://fumbbl.com/FUMBBL/Images/Icons/disclosure.png"
              /></a>
              <ul class="submenu" v-show="mainMenuShow === 'misc'">
                <li>
                  <a
                    :href="`https://fumbbl.com/p/team?op=reportteam&team_id=${team.getId()}`"
                    >Report</a
                  >
                </li>
              </ul>
            </li>
            <li
              v-if="accessControl.canViewHistory() || team.isLeagueDivision()"
              class="menu"
              @mouseenter="menuShow('show')"
              @mouseleave="menuHide()"
            >
              <a @click.prevent="menuToggle('show')" href="#"
                >Show
                <img
                  src="https://fumbbl.com/FUMBBL/Images/Icons/disclosure.png"
              /></a>
              <ul class="submenu" v-show="mainMenuShow === 'show'">
                  <li>
                    <a
                      href="#" @click.prevent="showTeamPanel('teambio')"
                      >Bio</a
                    >
                  </li>
                  <li v-if="team.isLeagueDivision()" class="menu">
                  <a
                    :href="`https://fumbbl.com/p/teamoptions?id=${team.getId()}`"
                    >Team options</a
                  >
                </li>
                <template v-if="accessControl.canViewHistory()">
                  <li>
                    <a
                      :href="`https://fumbbl.com/p/team?op=log&team_id=${team.getId()}`"
                      >Log</a
                    >
                  </li>
                  <li>
                    <a href="#" @click.prevent="showTeamPanel('teammatches')"
                      >Matches</a
                    >
                  </li>
                  <li>
                    <a href="#" @click.prevent="showTeamPanel('teamstats')"
                      >Stats</a
                    >
                  </li>
                  <li>
                    <a
                      :href="`https://fumbbl.com/p/team?op=development&team_id=${team.id}`"
                      >Development</a
                    >
                  </li>
                  <li>
                    <a
                      :href="`https://fumbbl.com/p/team?op=pastplayers&team_id=${team.id}`"
                      >Past Players</a
                    >
                  </li>
                  <li v-if="team.getCoach() != null">
                    <a
                      :href="`https://fumbbl.com/~${
                          encodeFumbblUrl(team.getCoach()!.name)
                      }/${
                          encodeFumbblUrl(team.getName())
                      }`"
                      >View Roster</a
                    >
                  </li>
                  <li>
                    <a
                      :href="`https://fumbbl.com/p/yearbook?team_id=${team.id}`"
                      >Yearbook</a
                    >
                  </li>
                  <li>
                    <a href="#" @click.prevent="showTeamPanel('teamdebug')"
                      >Debug</a
                    >
                  </li>
                </template>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <div class="quickstats">
        <div class="division">{{ team.getDivision() }}</div>
        <div class="infobox">
          <div class="title">Games</div>
          <div class="info">{{ team.record.games }}</div>
        </div>
        <div class="infobox">
          <div class="title">Season</div>
          <div class="info">
            S{{ team.seasonInfo.currentSeason }} G{{
              team.seasonInfo.gamesPlayedInCurrentSeason
            }}
          </div>
        </div>
        <div class="infobox">
          <div class="title">Record</div>
          <div class="info">
            {{ team.record.wins }}/{{ team.record.ties }}/{{
              team.record.losses
            }}
          </div>
        </div>
        <div class="infobox">
          <div class="title">Form</div>
          <div class="info">{{ team.record.form }}</div>
        </div>
        <div class="infobox">
          <div class="title">TD / g</div>
          <div class="info">
            {{
              (
                team.record.td.for /
                (team.record.games == 0 ? 1 : team.record.games)
              ).toFixed(2)
            }}
          </div>
        </div>
        <div class="infobox">
          <div class="title">Cas / g</div>
          <div class="info">
            {{
              (
                team.record.cas.for /
                (team.record.games == 0 ? 1 : team.record.games)
              ).toFixed(2)
            }}
          </div>
        </div>
      </div>
    </div>

    <div class="biowrapper" v-if="team.bio != null && team.bio.length > 0">
      <div id="bio" :class="{bio: true, expand: bioExpanded}" v-html="team.bio"></div>
    </div>

    <div class="center">
      <div style="float: right" v-if="showBioSizeToggle" :key="bioKey">
        <a href="#" v-if="bioExpanded" :key="bioKey" @click.prevent="toggleBio()">Collapse</a>
        <a href="#" v-else @click.prevent="toggleBio()">Show More</a>
      </div>
      <a :href="'/p/team?id='+team.id">Back to legacy team page</a>
    </div>
    <div class="container" :class="{ showsidepanel: showSidePanel }">
      <div class="panel teamsheet" :class="{ hidden: showSidePanel }">
        <div v-if="accessControl.canCreate()" class="createteamstats">
          <div class="playerinfo">
            <span class="currentplayercount">{{
              team.getRosteredPlayers().length
            }}</span>
            <span class="text"
              >Players ({{
                teamManagementSettings.startPlayers
              }}
              required)</span
            >
            <span class="text">&bull;</span>
            <span class="text">Treasury</span>
            <span class="treasury">{{ team.treasury / 1000 }}k</span>
            <span class="text">&bull;</span>
            <a href="#" @click.prevent="removeAllPlayers">Remove all players</a>
          </div>
          <div class="costinfo">
            <div class="currentteamcostlabel">
              Treasury spent (Max
              {{ teamManagementSettings.startTreasury / 1000 }}k)
            </div>
            <div class="currentteamcost">{{ teamCreationCost / 1000 }}k</div>
          </div>
        </div>
        <div v-if="false" class="redraft">
          <div class="redraftcalculation">
            <div class="budgetlabel">Re-drafting Budget</div>
            <div class="playercostlabel">Player (re-)hiring cost</div>
            <div class="othercostlabel">Team staff cost</div>
            <div class="remainingbudgetlabel">Remaining budget</div>
            <div class="budget">1145k</div>
            <div class="subtract1">-</div>
            <div class="playercost">1470k</div>
            <div class="subtract2">-</div>
            <div class="othercost">210k</div>
            <div class="equals">=</div>
            <div class="remainingbudget">-535k</div>
            <div class="errormessage">
              <template v-if="true"
                >⚠ Not enough money to cover team cost.</template
              >
            </div>
          </div>

          <div class="redraftactions">
            <div class="restartredraft">
              <a href="#">Restart redraft</a> (clears all changes)
            </div>
            <div class="finishredraft" v-if="true">
              <a href="#">Finish redraft</a> (saves your changes)
            </div>
          </div>
        </div>

        <div :class="{ showhirerookies: showHireRookiesWithPermissionsCheck }">
          <hirerookies
            v-if="showHireRookiesWithPermissionsCheck"
            :roster-position-data-for-buying-player="
              rosterPositionDataForBuyingPlayer
            "
            :roster-icon-manager="rosterIconManager"
            :has-empty-team-sheet-entry="team.hasEmptyNumbers()"
            :max-big-guys="teamManagementSettings.maxBigGuys"
            @hire-rookie="handleHireRookie"
            @hide-panel="enableShowHireRookies"
          ></hirerookies>
          <div class="playerrowsouter">
            <div
              :class="{
                playerrows: true,
                showplayercontrols: accessControl.canShowPlayerControls(),
              }"
            >
              <div class="playerrowsheader">
                <template v-if="!showHireRookiesWithPermissionsCheck">
                  <div class="cell"></div>
                  <div class="cell"></div>
                  <div class="cell statma">Ma</div>
                  <div class="cell statst">St</div>
                  <div class="cell statag">Ag</div>
                  <div class="cell statpa">Pa</div>
                  <div class="cell statav">Av</div>
                  <div class="cell skills">Skills</div>
                  <div class="cell injuries">Inj</div>
                  <div class="cell spp">SPP</div>
                  <div class="cell cost">Cost</div>
                  <div
                    v-if="accessControl.canCreate()"
                    class="cell removenewplayer"
                  ></div>
                  <div
                    v-else-if="accessControl.canEdit()"
                    class="cell removenewplayer"
                  ></div>
                </template>
                <template v-else>
                  <div class="cell">&nbsp;</div>
                </template>
              </div>

              <SortableTable
                v-if="team.players !== undefined"
                :Items="team.players"
                :FootItems="team.extraPlayers"
                @onEnd="onPlayerRenumbered"
                :key="playerListKey"
              >
                <template v-slot="prop">
                  <template v-if="!prop.item.empty">
                    <player
                      :key="prop.item.key"
                      :fumbbl-api="fumbblApi"
                      :player="prop.item"
                      :access-control="accessControl"
                      :roster-icon-manager="rosterIconManager"
                      :name-generator="teamManagementSettings.nameGenerator"
                      :compact-view="showHireRookiesWithPermissionsCheck"
                      :team-status="team.getTeamStatus()"
                      :treasury="team.treasury"
                      @remove-player="handleRemovePlayer"
                      @refund-player="handleRefundPlayer"
                      @nominate-retire-player="handleNominateRetirePlayer"
                      @hire-journeyman="handleHireJourneyman"
                      @skill-player="showSkillPlayer"
                      @fold-out="handleFoldOut"
                      @show-hire-rookies="enableShowHireRookies"
                    ></player>
                  </template>
                  <template v-else>
                    <div></div>
                    <div>{{ prop.item.number }}</div>
                    <div>Empty</div>
                  </template>
                </template>
              </SortableTable>
            </div>
            <div class="playerrowsfooter">
              <div class="playercount">
                {{ team.countPlayersAvailableNextGame() }} players
                <span v-if="team.countMissNextGamePlayers() > 0"
                  >(+{{ team.countMissNextGamePlayers() }} players missing next
                  game)</span
                >
              </div>
              <specialrules
                :fumbbl-api="fumbblApi"
                :team-id="team.getId()"
                :can-edit="accessControl.canCreate()"
                :raw-api-special-rules="rawApiSpecialRules"
                @rules-updated="handleSpecialRulesUpdated"
              ></specialrules>
            </div>
          </div>
        </div>
        <div
          class="teammanagement"
          :class="{ editteam: accessControl.canEdit() }"
        >
          <div class="teammanagementrow">
            <div class="title left">Coach:</div>
            <div class="info left" v-if="team.coach != null">
              <a :href="'/~' + team.coach.name">{{ team.coach.name }}</a>
            </div>
            <div class="title right">
              Re-Rolls ({{ rerollCostForMode / 1000 }}k):
            </div>
            <div class="info right">
              <addremove
                :current-value="team.getRerolls().toString()"
                :can-edit="accessControl.canEdit()"
                :can-remove-immediately="accessControl.canCreate()"
                :can-add="addRemovePermissions.rerolls.add"
                :can-remove="addRemovePermissions.rerolls.remove"
                :label-add="accessControl.canCreate() ? 'Add' : 'Buy'"
                :label-remove="accessControl.canCreate() ? 'Remove' : 'Discard'"
                @add="addReroll"
                @remove-with-confirm="discardRerollModal?.show()"
                @remove-immediately="removeReroll"
              ></addremove>
            </div>
          </div>
          <div class="teammanagementrow">
            <div class="title left">Roster:</div>
            <div class="info left">
              {{ teamManagementSettings.rosterName }}
            </div>
            <div class="title right">Dedicated Fans:</div>
            <div class="info right">
              <addremove
                :current-value="team.getDedicatedFans().toString()"
                :can-edit="accessControl.canCreate()"
                :can-remove-immediately="accessControl.canCreate()"
                :can-add="addRemovePermissions.dedicatedFans.add"
                :can-remove="addRemovePermissions.dedicatedFans.remove"
                :label-add="accessControl.canCreate() ? 'Add' : 'Buy'"
                :label-remove="accessControl.canCreate() ? 'Remove' : 'Discard'"
                @add="addDedicatedFans"
                @remove-immediately="removeDedicatedFans"
              ></addremove>
            </div>
          </div>
          <div class="teammanagementrow">
            <div class="title left">Current Team Value:</div>
            <div class="info left">
              {{ currentTeamValue / 1000 }}k<span
                v-if="team.getTvLimitDisplay() !== 0"
              >
                (±{{ team.getTvLimitDisplay() }})</span
              >
            </div>
            <div class="title right">Assistant Coaches:</div>
            <div class="info right">
              <addremove
                :current-value="team.getAssistantCoaches().toString()"
                :can-edit="accessControl.canEdit()"
                :can-remove-immediately="accessControl.canCreate()"
                :can-add="addRemovePermissions.assistantCoaches.add"
                :can-remove="addRemovePermissions.assistantCoaches.remove"
                :label-add="accessControl.canCreate() ? 'Add' : 'Buy'"
                :label-remove="accessControl.canCreate() ? 'Remove' : 'Fire'"
                @add="addAssistantCoach"
                @remove-with-confirm="fireAssistantCoachModal?.show()"
                @remove-immediately="removeAssistantCoach"
              ></addremove>
            </div>
          </div>
          <div class="teammanagementrow">
            <div class="title left">Treasury:</div>
            <div class="info left">{{ team.treasury / 1000 }}k</div>
            <div class="title right">Cheerleaders:</div>
            <div class="info right">
              <addremove
                :current-value="team.getCheerleaders().toString()"
                :can-edit="accessControl.canEdit()"
                :can-remove-immediately="accessControl.canCreate()"
                :can-add="addRemovePermissions.cheerleaders.add"
                :can-remove="addRemovePermissions.cheerleaders.remove"
                :label-add="accessControl.canCreate() ? 'Add' : 'Buy'"
                :label-remove="accessControl.canCreate() ? 'Remove' : 'Fire'"
                @add="addCheerleader"
                @remove-with-confirm="fireCheerleaderModal?.show()"
                @remove-immediately="removeCheerleader"
              ></addremove>
            </div>
          </div>
          <div class="teammanagementrow">
            <div class="title left">Team Value:</div>
            <div class="info left">{{ teamValue / 1000 }}k</div>
            <div class="title right">Apothecary:</div>
            <div class="info right">
              <addremove
                :current-value="team.getApothecary() ? 'Yes' : 'No'"
                :can-edit="
                  accessControl.canEdit() &&
                  teamManagementSettings.apothecaryAllowed
                "
                :can-remove-immediately="accessControl.canCreate()"
                :can-add="addRemovePermissions.apothecary.add"
                :can-remove="addRemovePermissions.apothecary.remove"
                :label-add="accessControl.canCreate() ? 'Add' : 'Hire'"
                :label-remove="accessControl.canCreate() ? 'Remove' : 'Fire'"
                @add="addApothecary"
                @remove-with-confirm="fireApothecaryModal?.show()"
                @remove-immediately="removeApothecary"
              ></addremove>
            </div>
          </div>
          <div
            v-if="
              teamManagementSettings.seasonsEnabled &&
              accessControl.canViewHistory()
            "
            class="teammanagementrow"
          >
            <div class="title left">Games this Season:</div>
            <div class="info left">
              {{ team.getGamesPlayedInSeason() }} /
              {{ teamManagementSettings.seasonLength }}
              <span v-if="team.getCurrentSeason() > 1">
                (Season {{ team.getCurrentSeason() }})</span
              >
            </div>
            <div class="title right">Current Re-draft Budget:</div>
            <div class="info right">
              <div class="data" :title="team.getRedraftTooltip()">
                {{ team.getRedraftCappedBudget() / 1000 }}k
              </div>
              <div v-if="accessControl.canEdit()" class="editteamcontrols">
                <!-- deliberately empty -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel sidepanel" :class="{ hidden: !showSidePanel }">
        <div v-show="sidePanel == 'teamstats'" class="teamstats">
          <TeamStats
            ref="teamStats"
            @unexpected-error="triggerUnexpectedError"
            @close="showTeamPanel('main')"
            :team="team"
            :fumbblApi="fumbblApi"
          ></TeamStats>
        </div>
        <div v-show="sidePanel == 'teammatches'" class="teammatches">
          <TeamMatches
            ref="teamMatches"
            @unexpected-error="triggerUnexpectedError"
            @close="showTeamPanel('main')"
            :team="team"
            :fumbblApi="fumbblApi"
          ></TeamMatches>
        </div>
        <div v-show="sidePanel == 'teambio'" class="teambio">
          <TeamBio
            ref="teamBio"
            @unexpected-error="triggerUnexpectedError"
            @close="showTeamPanel('main')"
            :team="team"
            :fumbblApi="fumbblApi"
          ></TeamBio>
        </div>
        <div v-show="sidePanel == 'teamdebug'" class="teamdebug">
          <TeamDebug
            ref="teamDebug"
            @unexpected-error="triggerUnexpectedError"
            @close="showTeamPanel('main')"
            :team="team"
            :fumbblApi="fumbblApi"
          ></TeamDebug>
        </div>
      </div>
    </div>

    <ErrorModal ref="errorModal"/>
    <CreateErrorModal ref="createErrorModal" :teamManagementSettings="teamManagementSettings" :team="team"/>
    <DiscardRerollModal ref="discardRerollModal" @confirm="removeReroll"/>
    <FireAssistantCoachModal ref="fireAssistantCoachModal" @confirm="removeAssistantCoach"/>
    <FireCheerleaderModal ref="fireCheerleaderModal" @confirm="removeCheerleader"/>
    <FireApothecaryModal ref="fireApothecaryModal" @confirm="removeApothecary"/>
    <ActivateTeamModal ref="activateTeamModal" @confirm="handleActivateTeam"/>
    <DeleteTeamModal ref="deleteTeamModal" @confirm="handleDeleteTeam" :teamManagementSettings="teamManagementSettings" :team="team"/>
    <RetireTeamModal ref="retireTeamModal" @confirm="handleRetireTeam" :teamManagementSettings="teamManagementSettings" :team="team"/>
    <SetTreasuryModal ref="setTreasuryModal" @confirm="handleSetTreasury" :teamManagementSettings="teamManagementSettings" :team="team"/>
    <SetDedicatedFansModal ref="setDedicatedFansModal" @confirm="handleSetDedicatedFans" :teamManagementSettings="teamManagementSettings" :team="team"/>
    <RenameAllPlayersModal ref="renameAllPlayersModal" @confirm="handleRenameAllPlayers" :teamManagementSettings="teamManagementSettings" :team="team"/> 

    <modal
      v-show="modals.skillPlayer === true"
      :modal-size="'skill'"
      :exclude-header="true"
      :exclude-buttons="true"
    >
      <template v-slot:header> Skill Player </template>

      <template v-slot:body>
        <button @click="handleSkillPlayer" class="largeclosebutton">
          <img src="https://fumbbl.com/FUMBBL/Images/cross.png" />
        </button>
        <iframe
          v-if="modals.skillPlayer && skillingPlayer != null"
          style="border-radius: 5px; width: 800px; height: 496px"
          :src="
            '/p/selectskill?teamId=' +
            team.id +
            '&playerId=' +
            skillingPlayer.id
          "
          title="Select Skill"
        ></iframe>
      </template>
    </modal>

    <modal
      ref="postMatchModal"
      class="postmatch"
      v-show="modals.readyTeam === true"
      :button-settings="{
        cancel: { enabled: true, label: 'Close' },
        confirm: { enabled: !readyToPlayTriggered, label: 'Ready to Play' },
      }"
      :modal-size="'medium'"
      @cancel="modals.readyTeam = false"
      @confirm="triggerReadyToPlay"
    >
      <template v-slot:header> Complete Post-Match </template>

      <template v-slot:body>
        <div class="expensivemistakes">
          <div
            v-if="willTriggerExpensiveMistakes && !readyToPlayTriggered"
            class="warning"
          >
            <div class="paragraph">
              Treasury {{ team.treasury / 1000 }}k is greater than
              {{ teamManagementSettings.expensiveMistakesStart / 1000 }}k
            </div>
            <div class="paragraph">Expensive mistakes will be triggered</div>
          </div>

          <div v-if="readyToPlayTriggered" class="warning emresult">
            <div class="title">Expensive Mistakes</div>
            <div class="emRoll">
              <die
                type="d6"
                ref="emDie"
                @complete="completeExpensiveMistakes"
              ></die>
            </div>
            <div v-if="showEmResult">{{ emResult }}</div>
            <div v-if="showEmResult">Lost {{ emTreasuryLoss }}</div>
          </div>
        </div>
        <readytoplay
          ref="readyToPlayComponent"
          :class="{
            invisible: !accessControl.canReadyTeam() || readyToPlayTriggered,
          }"
          :journeymanQuantityForNextGame="journeymanQuantityForNextGame"
          :journeymanPositions="teamManagementSettings.journeymanPositions"
          @ready-to-play="handleReadyToPlay"
        ></readytoplay>
      </template>
    </modal>

    <retireplayer
      v-if="playerToRetire && !playerToRetire.getIsRefundable()"
      :fumbblApi="fumbblApi"
      :player="playerToRetire"
      @nominate-retire-player-cancel="handleNominateRetirePlayerCancel"
      @nominate-retire-player-confirm="handleNominateRetirePlayerConfirm"
    ></retireplayer>
  </div>
  <div class="team" v-else>
    <div class="teamheader loading">
      <Spinner></Spinner>
    </div>
    <div class="container">
      <div class="panel loadersheet">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, nextTick } from "vue";
import {
  Prop,
  Component,
  Vue,
  toNative,
  Emit,
  Ref,
} from "vue-facing-decorator";
import { SortableTable, Die, Spinner } from "@components/fumbblcomponents";
import {
  AddRemovePermissions,
  JourneymanQuantityChoice,
  PlayerGender,
  PositionDataForBuyingPlayer,
  RawApiSpecialRules,
  UserRole,
  Position,
} from "../include/Interfaces";
import AccessControl from "../include/AccessControl";
import Team from "../include/Team";
import PlayerComponent from "./Player.vue";
import EditTeamNameComponent from "./EditTeamName.vue";
import HireRookiesComponent from "./HireRookies.vue";
import RosterIconManager from "../include/RosterIconManager";
import TeamManagementSettings from "../include/TeamManagementSettings";
import SpecialRulesComponent from "./SpecialRules.vue";
import AddRemoveComponent from "./AddRemove.vue";
import ModalComponent from "./Modal.vue";
import RetirePlayerComponent from "./RetirePlayer.vue";
import ReadyToPlayComponent from "./ReadyToPlay.vue";
import FumbblApi from "../include/FumbblApi";
import Player from "../include/Player";
import TeamStats from "./TeamStats.vue";
import TeamMatches from "./TeamMatches.vue";
import TeamBio from "./TeamBio.vue";
import TeamDebug from "./TeamDebug.vue";
import {
  DiscardRerollModal, 
  FireAssistantCoachModal,
  FireCheerleaderModal,
  FireApothecaryModal,
  ErrorModal,
  ActivateTeamModal,
  CreateErrorModal,
  DeleteTeamModal,
  RetireTeamModal,
  SetTreasuryModal,
  SetDedicatedFansModal,
  RenameAllPlayersModal,
} from "./modals/Modals"

import {
  EventDataFoldOut,
  EventDataRefundPlayer,
  EventDataRemovePlayer,
} from "../include/EventDataInterfaces";
import EditTeamName from "./EditTeamName.vue";

@Component({
  components: {
    editteamname: EditTeamNameComponent,
    player: PlayerComponent,
    hirerookies: HireRookiesComponent,
    specialrules: SpecialRulesComponent,
    addremove: AddRemoveComponent,
    modal: ModalComponent,
    retireplayer: RetirePlayerComponent,
    readytoplay: ReadyToPlayComponent,
    SortableTable,
    die: Die,
    TeamStats,
    TeamMatches,
    TeamBio,
    TeamDebug,
    Spinner,
    DiscardRerollModal,
    FireAssistantCoachModal,
    FireCheerleaderModal,
    FireApothecaryModal,
    ErrorModal,
    ActivateTeamModal,
    CreateErrorModal,
    DeleteTeamModal,
    RetireTeamModal,
    SetTreasuryModal,
    SetDedicatedFansModal,
    RenameAllPlayersModal,
  },
})
class TeamComponent extends Vue {
  @Prop({
    type: Object as PropType<FumbblApi>,
    required: true,
  })
  public fumbblApi!: FumbblApi;

  @Prop({
    type: String,
    required: true,
  })
  public coachName!: string;

  @Prop({
    type: Number,
    required: true,
  })
  public teamId!: number;

  @Prop({
    type: Boolean,
    required: true,
  })
  public isSiteStaff!: boolean;

  @Prop({
    type: Boolean,
    required: true,
  })
  public isLeagueStaff!: boolean;

  @Emit("unexpected-error")
  public triggerUnexpectedError(errorMessage: string): string {
    return errorMessage;
  }

  @Emit("delete-team")
  public triggerDeleteTeam() {}

  @Ref
  private emDie: InstanceType<typeof Die>|undefined;

  @Ref
  private readyToPlayComponent: InstanceType<typeof ReadyToPlayComponent>|undefined;

  @Ref
  private postMatchModal: InstanceType<typeof ModalComponent>|undefined;

  @Ref
  private teamStats: InstanceType<typeof TeamStats>|undefined;
  @Ref
  private teamMatches: InstanceType<typeof TeamMatches>|undefined;
  @Ref
  private teamBio: InstanceType<typeof TeamBio>|undefined;
  @Ref
  private teamDebug: InstanceType<typeof TeamDebug>|undefined;
  @Ref
  private nameEdit: InstanceType<typeof EditTeamName>|undefined;

  @Ref
  public discardRerollModal: InstanceType<typeof DiscardRerollModal>|undefined;
  @Ref
  public fireAssistantCoachModal: InstanceType<typeof FireAssistantCoachModal>|undefined;
  @Ref
  public fireCheerleaderModal: InstanceType<typeof FireCheerleaderModal>|undefined;
  @Ref
  public fireApothecaryModal: InstanceType<typeof FireApothecaryModal>|undefined;
  @Ref
  public errorModal: InstanceType<typeof ErrorModal>|undefined;
  @Ref
  public activateTeamModal: InstanceType<typeof ActivateTeamModal>|undefined;
  @Ref
  public createErrorModal: InstanceType<typeof CreateErrorModal>|undefined;
  @Ref
  public deleteTeamModal: InstanceType<typeof DeleteTeamModal>|undefined;
  @Ref
  public retireTeamModal: InstanceType<typeof RetireTeamModal>|undefined;
  @Ref
  public setTreasuryModal: InstanceType<typeof SetTreasuryModal>|undefined;
  @Ref
  public setDedicatedFansModal: InstanceType<typeof SetDedicatedFansModal>|undefined;
  @Ref
  public renameAllPlayersModal: InstanceType<typeof RenameAllPlayersModal>|undefined;

  private readonly MODIFICATION_RELOAD_DELAY: number = 5000;

  // the following properties (prefixed with data) must be initialized in order to become reactive data properties
  // to avoid warnings we provide getters for each without the data prefix, which also ignore the possibility of them being undefined
  public team: Team = new Team("C", 0, 0, 16);
  public dataTeamManagementSettings?: TeamManagementSettings = undefined;
  public dataAccessControl?: AccessControl = undefined;
  public dataRosterIconManager?: RosterIconManager = undefined;

  private teamLastModifiedTimestamp: number = 0;
  private userRoles: UserRole[] = [];
  public editTeamNameInProgress: boolean = false;
  public dedicatedFansChoice: number = 0;
  public playerToRetire: Player | null = null;
  public rawApiSpecialRules: RawApiSpecialRules = {
    fromRoster: null,
    fromTeam: null,
  };
  public mainMenuShow: string = "none";
  private showHireRookies: boolean = false;
  public skillingPlayer: Player | null = null;
  public showEmResult: boolean = false;
  public emResult: string = "";
  public emTreasuryLoss: string = "";
  public readyToPlayTriggered: boolean = false;
  private teamSheetHidden: boolean = false;

  public sidePanel: string = "";
  public showSidePanel: boolean = false;
  public playerListKey: number = 0;

  public showBioSizeToggle: boolean = false;
  public bioExpanded: boolean = false;
  public bioKey: number = 0;

  public modals: {
    deleteTeam: boolean;
    retireTeam: boolean;
    removeReroll: boolean;
    skillPlayer: boolean;
    readyTeam: boolean;
  } = {
    deleteTeam: false,
    retireTeam: false,
    removeReroll: false,
    skillPlayer: false,
    readyTeam: false,
  };

  public menuShow(menu: string) {
    this.mainMenuShow = menu;
  }

  public menuToggle(menu: string) {
    this.mainMenuShow = menu == this.mainMenuShow ? "none" : menu;
  }

  public menuHide() {
    this.mainMenuShow = "none";
  }

  async mounted() {
    await this.reloadTeam();

    this.userRoles.push("ANYONE");

    this.userRoles.push(this.coachName === "" ? "ANONYMOUS" : "LOGGED_IN");

    if (this.team.getCoach() != null && this.team.getCoach()!.name === this.coachName) {
      this.userRoles.push("OWNER");
    } else {
      this.userRoles.push("NOT_OWNER");
    }

    if (this.isSiteStaff) {
      this.userRoles.push("SITE_STAFF");
    }

    if (this.isLeagueStaff) {
      this.userRoles.push("LEAGUE_STAFF");
    }

    if (this.team.getTeamStatus().isNew()) {
      this.showHireRookies = true;
    }

    this.dedicatedFansChoice = this.team.getDedicatedFans();

    // Reload the team when someone returns to the tab
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.reloadTeam();
      }
    });
    await this.refreshBioToggle();
  }

  public async toggleBio() {

    this.bioExpanded = !this.bioExpanded;
    this.bioKey++;
    await this.refreshBioToggle();
  }

  public async refreshBioToggle() {
    await nextTick();
    const bioPanel = document.getElementById('bio');
    if (bioPanel == null) {
      return;
    }
    this.showBioSizeToggle = this.bioExpanded || bioPanel.scrollHeight > bioPanel.offsetHeight;
  }

  public async showTeamPanel(panel: string) {
    this.mainMenuShow = "";

    switch (panel) {
      case "teamstats":
        if (this.teamStats != undefined) {
          await this.teamStats.loadStats();
        }
        break;
      case "teammatches":
        if (this.teamMatches != undefined) {
          await this.teamMatches.loadMatches();
        }
        break;
      case "teambio":
        if (this.teamBio != undefined) {
          await this.teamBio.loadBio();
        }
        break;
    }

    this.showSidePanel = panel != "main";

    if (this.showSidePanel) {
      this.sidePanel = panel;
    }
  }

  private async reloadTeam() {
    const apiResponse = await this.fumbblApi.getTeam(this.teamId);
    if (apiResponse.isSuccessful()) {
      const rawApiTeam = apiResponse.getData();
      this.rawApiSpecialRules.fromTeam = rawApiTeam.specialRules;
      await this.setupForRulesetAndRoster(
        rawApiTeam.ruleset,
        rawApiTeam.roster.id,
      );

      // Make sure that the same icon stays with the same player throughout the session
      const playerRosterIconVersionPositions: any = {};
      if (this.team) {
        for (const player of this.team.getPlayers()) {
          playerRosterIconVersionPositions[player.getId()] =
            player.getIconRowVersionPosition();
        }
      }

      let newTeam = Team.fromApi(
        rawApiTeam,
        this.teamManagementSettings.minStartFans,
        this.teamManagementSettings,
        playerRosterIconVersionPositions,
        this.rosterIconManager,
      );

      this.team = newTeam;

      this.dataAccessControl = new AccessControl(
        this.userRoles,
        this.team.getTeamStatus().getStatus(),
        this.teamManagementSettings.isProgression,
      );
    } else {
      this.triggerUnexpectedError(
        "Loading team information: " + apiResponse.getErrorMessage(),
      );
    }
  }

  private reloadTeamWithDelay() {
    const currentTimestamp = Date.now();
    this.teamLastModifiedTimestamp = currentTimestamp;
    const reloadForRecentModification = () => {
      // TODO: do we need some protection here to avoid a reload during a drag?
      if (this.teamLastModifiedTimestamp === currentTimestamp) {
        this.reloadTeam();
      }
    };
    setTimeout(reloadForRecentModification, this.MODIFICATION_RELOAD_DELAY);
  }

  private created() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  private destroyed() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (this.accessControl && this.accessControl.canEdit()) {
        if (event.key === "$") {
          event.preventDefault();
          this.enableShowHireRookies();
        }
      }
    }
  }

  private async recoverFromUnexpectedError(
    generalErrorMessage: string,
    technicalErrorMessage: string,
  ) {
    this.errorModal?.show({
      general: generalErrorMessage,
      technical: technicalErrorMessage,
    });
    await this.reloadTeam();
  }

  private async setupForRulesetAndRoster(rulesetId: number, rosterId: number) {
    // Prevent this basic set up from running more than once
    if (
      this.teamManagementSettings !== null &&
      this.rawApiSpecialRules.fromRoster !== null &&
      this.rosterIconManager !== null
    ) {
      return;
    }

    const apiResponseRuleset = await this.fumbblApi.getRuleset(rulesetId);
    const apiResponseRoster = await this.fumbblApi.getRoster(rosterId);

    if (apiResponseRuleset.isSuccessful() && apiResponseRoster.isSuccessful()) {
      const rawApiRuleset = apiResponseRuleset.getData();
      const rawApiRoster = apiResponseRoster.getData();

      this.rawApiSpecialRules.fromRoster = rawApiRoster.specialRules;
      let hasLowCostLinemen = false;
      for (const specialRule of this.rawApiSpecialRules.fromRoster) {
        if (specialRule.name === "Low Cost Linemen") {
          hasLowCostLinemen = true;
        }
      }

      await this.setupRosterIconManager(rawApiRoster.positions);
      this.dataTeamManagementSettings = new TeamManagementSettings(
        rawApiRuleset,
        rawApiRoster,
        hasLowCostLinemen,
      );

      const rulesetVersion = rawApiRuleset.options.rulesetOptions.version;
      const skillProgressionType =
        rawApiRuleset.options.teamSettings.skillProgressionType;
      if (
        rulesetVersion !== "2020" ||
        !["bb2020", "predetermined"].includes(skillProgressionType)
      ) {
        this.triggerUnexpectedError(
          "Unsupported team type. Currently this page only supports Teams using the 2020 ruleset (must be using 2020 skill progression as well.)",
        );
      }
    } else {
      let currentAction = "";
      let errorMessage = "";
      if (!apiResponseRuleset.isSuccessful()) {
        currentAction = "Loading ruleset information";
        errorMessage = apiResponseRuleset.getErrorMessage();
      } else {
        currentAction = "Loading roster information";
        errorMessage = apiResponseRoster.getErrorMessage();
      }
      this.triggerUnexpectedError(currentAction + ": " + errorMessage);
    }
  }

  public async setupRosterIconManager(rawApiPositions: any[]) {
    const positionIconData = rawApiPositions.map((position: any) => {
      return {
        positionId: ~~position.id,
        positionIcon: ~~position.icon,
      };
    });
    const rosterIconManager = new RosterIconManager();
    await rosterIconManager.prepareIconData(positionIconData);

    this.dataRosterIconManager = rosterIconManager;
  }

  public get dataPropertiesInitialized(): boolean {
    return (
      this.team !== undefined &&
      this.dataTeamManagementSettings !== undefined &&
      this.dataAccessControl !== undefined &&
      this.dataRosterIconManager !== undefined
    );
  }

  public get teamManagementSettings(): TeamManagementSettings {
    return this.dataTeamManagementSettings!;
  }

  public get accessControl(): AccessControl {
    return this.dataAccessControl!;
  }

  public get rosterIconManager(): RosterIconManager {
    return this.dataRosterIconManager!;
  }

  public get teamValue(): number {
    return this.teamManagementSettings.calculateTeamValue(this.team);
  }

  public get currentTeamValue(): number {
    return this.teamManagementSettings.calculateCurrentTeamValue(this.team);
  }

  public get teamCreationCost(): number {
    return this.teamManagementSettings.calculateCreateTeamCost(this.team);
  }

  public get rosterPositionDataForBuyingPlayer(): PositionDataForBuyingPlayer[] {
    const positionQuantities: { positionId: number; quantity: number }[] = [];

    for (const position of this.teamManagementSettings.positions) {
      const positionQuantity = {
        positionId: position.id,
        quantity: this.team.countPlayersOfPositionId(position.id),
      };
      positionQuantities.push(positionQuantity);
    }

    return this.teamManagementSettings.getRosterPositionDataForBuyingPlayer(
      this.team.treasury,
      positionQuantities,
    );
  }

  public get showHireRookiesWithPermissionsCheck(): boolean {
    return this.showHireRookies && this.accessControl.canHireRookie();
  }

  public get addRemovePermissions(): AddRemovePermissions {
    return this.teamManagementSettings.getAddRemovePermissions(this.team);
  }

  public get divisionLogoImageUrl(): string {
    if (this.team.isCompetitiveDivision()) {
      return "https://fumbbl.com/i/677766";
    } else if (this.team.isLeagueDivision()) {
      return "https://fumbbl.com/FUMBBL/Images/Icons/league.png";
    } else {
      return "https://fumbbl.com/FUMBBL/Images/Race/unknown_196.png";
    }
  }

  public get rerollCostForMode(): number {
    if (this.team.getTeamStatus().isNew()) {
      return this.teamManagementSettings.rerollCostOnCreate;
    } else {
      return this.teamManagementSettings.rerollCostFull;
    }
  }

  public get journeymanQuantityForNextGame(): number {
    const playerDeficit =
      this.teamManagementSettings.startPlayers -
      this.team.countPlayersAvailableNextGame();
    return playerDeficit < 0 ? 0 : playerDeficit;
  }

  public async onPlayerRenumbered() {
    var newNumbers: { [key:number]: number } = {};
    this.team.players
      .filter((p) => !p.IsEmpty)
      .forEach((p) => (newNumbers[p.id] = p.playerNumber));
    const apiResponse = await this.fumbblApi.renumberPlayers(
      this.team.id,
      newNumbers,
    );
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred whilst renumbering your players.",
        apiResponse.getErrorMessage(),
      );
    }
    this.playerListKey++;
  }

  public async removeAllPlayers() {
    const playerIdsToRemove = this.team
      .getPlayers()
      .filter((p) => !p.IsEmpty)
      .map((player) => player.id);
    this.team.removeAllPlayers();
    // call this to immediately show the players have gone (handleGeneralTeamUpdate needs to be called after all have been fully removed).

    for (const playerId of playerIdsToRemove) {
      const apiResponse = await this.fumbblApi.removePlayer(
        this.team.getId(),
        playerId,
      );
      if (!apiResponse.isSuccessful()) {
        await this.recoverFromUnexpectedError(
          "An error occurred removing a player whilst removing all players from team.",
          apiResponse.getErrorMessage(),
        );
        return;
      }
    }

    // Important to call this after all players have finished being removed,
    // otherwise some players will reappear during the removal process.
    this.reloadTeamWithDelay();
  }

  public async updateDedicatedFans() {
    this.team.updateDedicatedFans(
      this.dedicatedFansChoice,
      this.teamManagementSettings.dedicatedFansCost,
    );
    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.setDedicatedFans(
      this.team.getId(),
      this.dedicatedFansChoice,
    );
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred setting dedicated fans.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async addReroll() {
    this.team.addReroll(
      this.team.getTeamStatus().isNew()
        ? this.teamManagementSettings.rerollCostOnCreate
        : this.teamManagementSettings.rerollCostFull,
    );
    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.addReroll(this.team.getId());
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred adding a reroll.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async removeReroll() {
    this.team.removeReroll(this.teamManagementSettings.rerollCostOnCreate);
    this.modals.removeReroll = false;
    this.reloadTeamWithDelay();

    let apiResponse = null;
    if (this.accessControl.canCreate()) {
      apiResponse = await this.fumbblApi.removeReroll(this.team.getId());
    } else {
      apiResponse = await this.fumbblApi.discardReroll(this.team.getId());
    }
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred removing a reroll.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async addDedicatedFans() {
    this.team.addDedicatedFans(this.teamManagementSettings.dedicatedFansCost);
    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.addDedicatedFans(this.team.getId());
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred adding dedicated fans.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async removeDedicatedFans() {
    this.team.removeDedicatedFans(this.teamManagementSettings.dedicatedFansCost);
    this.reloadTeamWithDelay();

    let apiResponse = null;
    if (this.accessControl.canCreate()) {
      apiResponse = await this.fumbblApi.removeDedicatedFans(this.team.getId());
      if (!apiResponse.isSuccessful()) {
        await this.recoverFromUnexpectedError(
          "An error occurred removing dedicated fans.",
          apiResponse.getErrorMessage(),
        );
      }
    }
  }

  public async addAssistantCoach() {
    this.team.addAssistantCoach(this.teamManagementSettings.assistantCoachCost);
    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.addAssistantCoach(
      this.team.getId(),
    );
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred adding an assistant coach.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async removeAssistantCoach() {
    this.team.removeAssistantCoach(
      this.teamManagementSettings.assistantCoachCost,
    );
    this.reloadTeamWithDelay();

    let apiResponse = null;
    if (this.accessControl.canCreate()) {
      apiResponse = await this.fumbblApi.removeAssistantCoach(
        this.team.getId(),
      );
    } else {
      apiResponse = await this.fumbblApi.fireAssistantCoach(this.team.getId());
    }
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred removing an assistant coach.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async addCheerleader() {
    this.team.addCheerleader(this.teamManagementSettings.cheerleaderCost);
    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.addCheerleader(this.team.getId());
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred adding a cheerleader.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async removeCheerleader() {
    this.team.removeCheerleader(this.teamManagementSettings.cheerleaderCost);
    this.reloadTeamWithDelay();

    let apiResponse = null;
    if (this.accessControl.canCreate()) {
      apiResponse = await this.fumbblApi.removeCheerleader(this.team.getId());
    } else {
      apiResponse = await this.fumbblApi.fireCheerleader(this.team.getId());
    }
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred removing a cheerleader.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async addApothecary() {
    this.team.addApothecary(this.teamManagementSettings.apothecaryCost);
    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.addApothecary(this.team.getId());
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred adding an apothecary.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async removeApothecary() {
    this.team.removeApothecary(this.teamManagementSettings.apothecaryCost);
    this.reloadTeamWithDelay();

    let apiResponse = null;
    if (this.accessControl.canCreate()) {
      apiResponse = await this.fumbblApi.removeApothecary(this.team.getId());
    } else {
      apiResponse = await this.fumbblApi.fireApothecary(this.team.getId());
    }
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred removing an apothecary.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public enableShowHireRookies(): void {
    this.showHireRookies = !this.showHireRookies;
  }

  private getGender(defaultGender: string): PlayerGender {
    const availableGenders: PlayerGender[] = [
      "FEMALE",
      "MALE",
      "NEUTRAL",
      "NONBINARY",
    ];
    if (
      availableGenders.includes(defaultGender.toUpperCase() as PlayerGender)
    ) {
      return defaultGender.toUpperCase() as PlayerGender;
    }
    return availableGenders[
      Math.floor(Math.random() * availableGenders.length)
    ];
  }

  public async handleRemovePlayer(
    eventDataRemovePlayer: EventDataRemovePlayer,
  ) {
    const player = this.team.findPlayerByNumber(
      eventDataRemovePlayer.playerNumber,
    );
    if (player === null || player.id !== eventDataRemovePlayer.playerId) {
      await this.recoverFromUnexpectedError(
        "Unable to remove player, if this problem continues please reload the page.",
        `Removing playerId ${eventDataRemovePlayer.playerId} from number ${
          eventDataRemovePlayer.playerNumber
        } but found playerId ${player ? player.id : "empty"}`,
      );
      return;
    }

    this.team.removePlayer(player);

    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.removePlayer(
      this.team.id,
      player.id,
    );
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred removing a player.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async handleRefundPlayer(
    eventDataRefundPlayer: EventDataRefundPlayer,
  ) {
    const player = this.team.findPlayerByNumber(
      eventDataRefundPlayer.playerNumber,
    );
    if (player === null || player.id !== eventDataRefundPlayer.playerId) {
      await this.recoverFromUnexpectedError(
        "Unable to refund player, if this problem continues please reload the page.",
        `Refunding playerId ${eventDataRefundPlayer.playerId} from number ${
          eventDataRefundPlayer.playerNumber
        } but found playerId ${player ? player.id : "empty"}`,
      );
      return;
    }

    this.team.removePlayer(player);

    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.refundPlayer(
      this.team.id,
      player.id,
    );
    if (apiResponse.isSuccessful()) {
      const refundPlayerResponseData = apiResponse.getData();

      // Refunded journeyman must be added back into the team
      // number property of response data is journeyman number
      if (refundPlayerResponseData.number !== null) {
        player.setPlayerNumber(refundPlayerResponseData.number);
        player.setIsJourneyman(true);
        this.team.addPlayer(player);
      }
    } else {
      await this.recoverFromUnexpectedError(
        "An error occurred refunding a player.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public handleNominateRetirePlayer(player: Player) {
    this.playerToRetire = player;

    // automatically confirm the retirement if the player is refundable
    if (player.getIsRefundable()) {
      this.handleNominateRetirePlayerConfirm();
    }
  }

  public handleNominateRetirePlayerCancel() {
    this.playerToRetire = null;
  }

  public async handleNominateRetirePlayerConfirm() {
    if (!this.playerToRetire) {
      return;
    }

    this.team.removePlayer(this.playerToRetire);

    this.reloadTeamWithDelay();

    const playerToRetireId = this.playerToRetire.id;
    this.playerToRetire = null;

    const apiResponse = await this.fumbblApi.retirePlayer(
      this.team.id,
      playerToRetireId,
    );
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred retiring a player.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async handleHireJourneyman(player: Player) {
    this.team.hireJourneyman(player);

    this.reloadTeamWithDelay();

    const apiResponse = await this.fumbblApi.hireJourneyman(
      this.team.getId(),
      player.getId(),
    );
    if (!apiResponse.isSuccessful()) {
      await this.recoverFromUnexpectedError(
        "An error occurred permanently hiring a journeyman.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async interceptReadyToPlay() {
    if (
      this.willTriggerExpensiveMistakes ||
      (this.journeymanQuantityForNextGame > 0 &&
        this.teamManagementSettings.journeymanPositions.length > 1)
    ) {
      this.showEmResult = false;
      this.readyToPlayTriggered = false;
      this.modals.readyTeam = true;
    } else {
      this.team.setTeamStatus("ACTIVE");
      this.triggerReadyToPlay();
    }
  }

  public async interceptSkipTournament() {
    this.team.setTeamStatus("ACTIVE");
    await this.fumbblApi.skipTournament(this.team.getId());
  }

  public getSpecialRuleErrors(teamSpecialRules: any): string[] {
    const errors: string[] = [];

    let oneOfChoiceRequired: boolean = false;
    let oneOfChoice: string | null = null;

    // Find out if a one of choice is required
    // Also find the choice made for the one of
    for (const specialRuleLabel of Object.keys(teamSpecialRules)) {
      const teamSpecialRule = teamSpecialRules[specialRuleLabel];
      const teamSpecialRuleChoice = teamSpecialRule[1];
      const teamSpecialRuleSettings = teamSpecialRule[2];
      if (
        typeof teamSpecialRuleSettings === "object" &&
        teamSpecialRuleSettings !== null
      ) {
        if (teamSpecialRuleSettings.oneOf === true) {
          oneOfChoiceRequired = true;
          oneOfChoice = teamSpecialRuleChoice;
          if (!teamSpecialRuleChoice) {
            errors.push("oneOfNotChosen");
          }
        }
      }
    }

    // For any multiple choice special rules, if they are a one of choice make sure the choice has been made, otherwise always make sure the choice has been made.
    for (const specialRuleLabel of Object.keys(teamSpecialRules)) {
      const teamSpecialRule = teamSpecialRules[specialRuleLabel];
      const teamSpecialRuleOptions = teamSpecialRule[0];
      const teamSpecialRuleChoice = teamSpecialRule[1];
      if (Array.isArray(teamSpecialRuleOptions)) {
        if (!teamSpecialRuleChoice) {
          if (!oneOfChoiceRequired || oneOfChoice === specialRuleLabel) {
            errors.push("specialRuleNotChosen");
          }
        }
      }
    }

    return errors;
  }    

  public activateTeam() {
      if (!this.team.getTeamStatus().isNew()) {
        return;
      }
      let specialRuleErrors = this.getSpecialRuleErrors(this.rawApiSpecialRules.fromTeam);

      let hasErrors: boolean = false;
      hasErrors ||= !this.teamManagementSettings.isValidForCreate(this.team);
      hasErrors ||= specialRuleErrors.length > 0;

      if (hasErrors) {
        this.createErrorModal?.show(specialRuleErrors);
      } else {
        this.activateTeamModal?.show();
      }
  }

  public async unreadyTeam() {
    this.menuHide();
    const originalTeamStatus = this.team.getTeamStatus();
    this.team.setTeamStatus("POST_MATCH_SEQUENCE");
    this.reloadTeamWithDelay();
    const apiResponse = await this.fumbblApi.unreadyTeam(this.team.getId());

    if (!apiResponse.isSuccessful()) {
      this.team.setTeamStatus(originalTeamStatus.getStatus());
      await this.recoverFromUnexpectedError(
        "An error occurred unreadying the team.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async renameTeam() {
    this.menuHide();
    this.nameEdit?.begin();
  }

  public async setTreasury() {
    this.menuHide();
    this.setTreasuryModal?.show();
  }

  public async setDedicatedFans() {
    this.menuHide();
    this.setDedicatedFansModal?.show();
  }

  public async renameAllPlayers() {
    this.menuHide();
    this.renameAllPlayersModal?.show();
  }

  public async magicFixTeam() {
    const apiResponse = await this.fumbblApi.magicFixTeam(this.team.getId());


    if (!apiResponse.isSuccessful()) {
      this.menuHide();
      this.reloadTeam();
    }
  }

  public async showSkillPlayer(player: Player) {
    this.skillingPlayer = player;
    this.modals.skillPlayer = true;
  }

  public async handleSkillPlayer() {
    await this.reloadTeam();
    this.modals.skillPlayer = false;
  }

  public handleFoldOut(eventDataFoldOut: EventDataFoldOut) {
    let playerRowFoldOutMode = eventDataFoldOut.playerRowFoldOutMode;
    let multipleOpenMode = eventDataFoldOut.multipleOpenMode;
    let playerNumber = eventDataFoldOut.playerNumber;

    if (playerRowFoldOutMode !== "CLOSED" && !multipleOpenMode) {
      this.team.players.forEach((player) => {
        player.foldOut = "CLOSED";
      });
    }

    const player = this.findPlayer(playerNumber);
    if (player != null) {
      player.foldOut = playerRowFoldOutMode;
    }
  }

  public findPlayer(number: number) {
    return this.team.players.find((p) => p.playerNumber === number);
  }

  public async handleHireRookie(positionId: number) {
    const firstEmptyNumber = this.team.findFirstEmptyNumber();
    if (!firstEmptyNumber) {
      return;
    }

    const position = this.teamManagementSettings.getPosition(positionId);
    const gender = this.getGender(position.defaultGender);
    const iconRowVersionPosition =
      this.rosterIconManager.getNextAvailableIconRowVersionPosition(
        positionId,
        this.team.getTakenIconRowVersionPositionsOfPositionId(positionId),
      );

    // Add quick temporary player for user interface responsiveness
    // This temporary player is removed when reload team is called later in this method
    const temporaryPlayer = this.buyTemporaryPlayer(
      firstEmptyNumber,
      this.teamManagementSettings.getPosition(positionId),
      iconRowVersionPosition,
      gender,
    );

    const apiResponsePlayerName = await this.fumbblApi.generatePlayerName(
      this.teamManagementSettings.nameGenerator,
      gender,
    );

    if (!apiResponsePlayerName.isSuccessful()) {
      this.team.removeTemporaryPlayers();
      await this.recoverFromUnexpectedError(
        "An error occurred when generating a player name.",
        apiResponsePlayerName.getErrorMessage(),
      );
      return;
    }

    const playerName = apiResponsePlayerName.getData();
    temporaryPlayer.setPlayerName(playerName);

    const apiResponse = await this.fumbblApi.addPlayer(
      this.team.getId(),
      positionId,
      gender,
      playerName,
    );
    if (apiResponse.isSuccessful()) {
      const newPlayerResponseData: { playerId: number; number: number } =
        apiResponse.getData();
      temporaryPlayer.setIdForTemporaryPlayer(newPlayerResponseData.playerId);

      this.reloadTeamWithDelay();
      if (temporaryPlayer.playerNumber !== newPlayerResponseData.number) {
        await this.recoverFromUnexpectedError(
          "Your player has been purchased but your team page is out of sync with the latest version on the server. Please refresh the page if this problem continues.",
          `Expected player number ${temporaryPlayer.playerNumber}, got ${newPlayerResponseData.number}`,
        );
      }
    } else {
      this.team.removeTemporaryPlayers();
      await this.recoverFromUnexpectedError(
        "An error occurred buying a new player.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  private buyTemporaryPlayer(
    number: number,
    position: Position,
    iconRowVersionPosition: number,
    playerGender: PlayerGender,
  ): Player {
    const temporaryPlayer = Player.temporaryPlayer(
      number,
      position,
      iconRowVersionPosition,
      playerGender,
    );
    this.team.buyPlayer(temporaryPlayer);
    return this.team.players[number - 1]; // Return the reactive version of the player
  }

  public async handleSpecialRulesUpdated(callback: any) {
    await this.reloadTeam();
    callback();
  }

  public handleBeginEditTeamName() {
    this.editTeamNameInProgress = true;
  }

  public handleCancelEditTeamName() {
    this.editTeamNameInProgress = false;
  }

  public async handleEditTeamName(newTeamName: string) {
    const originalTeamName = this.team.getName();
    this.team.setName(newTeamName);
    const apiResponse = await this.fumbblApi.renameTeam(
      this.team.getId(),
      newTeamName,
    );
    if (!apiResponse.isSuccessful()) {
      this.team.setName(originalTeamName);
      await this.recoverFromUnexpectedError(
        "Unable to rename team.",
        apiResponse.getErrorMessage(),
      );
    }
    this.reloadTeamWithDelay();
    this.editTeamNameInProgress = false;
  }

  public async handleActivateTeam() {
    const apiResponse = await this.fumbblApi.activateTeam(this.team.id);
    if (apiResponse.isSuccessful()) {
      await this.reloadTeam();
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
    } else {
      await this.recoverFromUnexpectedError(
        "An error occurred activating your team.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async handleDeleteTeam() {
    const apiResponse = await this.fumbblApi.deleteTeam(this.team.getId());
    if (apiResponse.isSuccessful()) {
      this.modals.deleteTeam = false;
      this.triggerDeleteTeam();
    } else {
      this.modals.deleteTeam = false;
      await this.recoverFromUnexpectedError(
        "An error occurred deleting your team.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async handleRetireTeam() {
    const apiResponse = await this.fumbblApi.retireTeam(this.team.getId());
    if (apiResponse.isSuccessful()) {
      await this.reloadTeam();
      this.modals.retireTeam = false;
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
    } else {
      this.modals.retireTeam = false;
      await this.recoverFromUnexpectedError(
        "An error occurred retiring your team.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async handleSetTreasury(newTreasury: number) {
    const apiResponse = await this.fumbblApi.setTreasury(this.team.getId(), newTreasury);
    if (apiResponse.isSuccessful()) {
      await this.reloadTeam();
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
    } else {
      await this.recoverFromUnexpectedError(
        "An error occurred setting team treasury.",
        apiResponse.getErrorMessage(),
      );
    }    
  }

  public async handleSetDedicatedFans(dedicatedFans: number) {
    const apiResponse = await this.fumbblApi.setDedicatedFans(this.team.getId(), dedicatedFans);
    if (apiResponse.isSuccessful()) {
      await this.reloadTeam();
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
    } else {
      await this.recoverFromUnexpectedError(
        "An error occurred setting team treasury.",
        apiResponse.getErrorMessage(),
      );
    }   
  }

  public async handleRenameAllPlayers() {
    const apiResponse = await this.fumbblApi.renameAllPlayers(this.team.getId());
    if (apiResponse.isSuccessful()) {
      await this.reloadTeam();
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
    } else {
      await this.recoverFromUnexpectedError(
        "An error occurred renaming all players.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public async handleReadyToPlay(
    journeymanQuantityChoices: JourneymanQuantityChoice[],
  ) {
    let postData = {
      journeymen: journeymanQuantityChoices,
    };
    const apiResponse = await this.fumbblApi.readyTeam(this.team.id, postData);

    if (apiResponse.isSuccessful()) {
      const emResult: any = apiResponse.getData();
      if (this.emDie != undefined && emResult != undefined && emResult.expensiveMistakes != undefined) {
        let roll = emResult.expensiveMistakes.roll;
        this.emResult = emResult.expensiveMistakes.effect;
        this.emTreasuryLoss = emResult.expensiveMistakes.treasuryLoss;

        this.emDie.roll(roll);
      } else {
        this.modals.readyTeam = false;
        await this.reloadTeam();
      }
    } else {
      await this.recoverFromUnexpectedError(
        "An error occurred readying your team.",
        apiResponse.getErrorMessage(),
      );
    }
  }

  public triggerReadyToPlay() {
    if (this.willTriggerExpensiveMistakes) {
      this.readyToPlayTriggered = true;
    }

    if (this.readyToPlayComponent != undefined) {
      this.readyToPlayComponent.triggerReadyToPlay();
    }
  }

  public async completeExpensiveMistakes() {
    this.showEmResult = true;
    await this.reloadTeam();
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 500);
  }

  public get willTriggerExpensiveMistakes() {
    return (
      this.teamManagementSettings.expensiveMistakesEnabled &&
      this.team.treasury >= this.teamManagementSettings.expensiveMistakesStart
    );
  }



  public encodeFumbblUrl(url: string): string {
      return encodeURIComponent(url).replaceAll("%20", "+");
  }
}

export default toNative(TeamComponent);
</script>
