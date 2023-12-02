<template>
    <div class="team" v-if="dataPropertiesInitialized">
        <div class="teamheader">
            <div class="rosterlogo quickstats">
              <div class="division">{{ teamManagementSettings.rosterName }}</div>
              <div class="infobox logo">
                <img class="logoimage" :src="`https://fumbbl.com/i/${teamManagementSettings.logoIdLarge}`" :alt="`Roster logo for ${teamManagementSettings.rosterName}`" :title="`Roster logo for ${teamManagementSettings.rosterName}`">
              </div>
              <div class="infobox">
                <div class="title">TV</div>
                <div class="info">{{ teamValue/1000 }}k</div>
              </div>
              <div class="infobox">
                <div class="title">CTV</div>
                <div class="info">{{ currentTeamValue/1000 }}k</div>
              </div>
            </div>
            <div class="teamheadermain">
                <div class="teamheadermaincontent">
                    <editteamname
                        :fumbbl-api="fumbblApi"
                        :team-name="team.getName()"
                        :can-edit="accessControl.canCreate()"
                        @edit="handleEditTeamName"
                        @begin="handleBeginEditTeamName"
                        @cancel="handleCancelEditTeamName"
                    ></editteamname>
                    <div class="rosterinfo" style="margin-top: 0.5em;">
                      <div class="status">{{team.getTeamStatus().displayName}}</div>
                    </div>
                    <ul class="teamnav">
                        <button v-if="team.getTeamStatus().isPostMatch() && accessControl.canReadyTeam()" class="menu" @click="interceptReadyToPlay">Complete</button>
                        <button v-else-if="team.getTeamStatus().isNew() && teamManagementSettings.isValidForCreate(team)" class="menu" @click="modals.activateTeam = true">Activate</button>
                        <button v-else-if="team.getTeamStatus().isNew()" @click="modals.errorsForCreate = true" class="menu">Activate</button>
                        <li class="menu">
                          <a href="#" v-if="accessControl.canEdit()" @click.prevent="enableShowHireRookies()">Hire Players</a>
                        </li>
                        <div class="spacer"></div>
                        <li v-if="accessControl.canViewHistory()" class="menu" @mouseenter="menuShow('show')" @mouseleave="menuHide('show')">
                            <a href="#">Show<img src="https://fumbbl.com/FUMBBL/Images/Icons/disclosure.png"></a>
                            <ul class="submenu" v-show="mainMenuShow === 'show'">
                                <li><a :href="`https://fumbbl.com/p/team?op=log&team_id=${team.getId()}`">Log</a></li>
                                <li><a href="#" @click.prevent="showTeamPanel('teammatches')">Matches</a></li>
                                <li><a href="#" @click.prevent="showTeamPanel('teamstats')">Stats</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=development&team_id=${team.id}`">Development</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=pastplayers&team_id=${team.id}`">Past Players</a></li>
                                <li><a :href="`https://fumbbl.com/~${team.getCoach().name}/${team.getName()}`">View Roster</a></li>
                                <li><a :href="`https://fumbbl.com/p/yearbook?team_id=${team.id}`">Yearbook</a></li>
                            </ul>
                        </li>
                        <li v-if="team.isLeagueDivision()" class="menu">
                            <a :href="`https://fumbbl.com/p/teamoptions?id=${team.getId()}`">Team options</a>
                        </li>
                        <li class="menu" @mouseenter="menuShow('misc')" @mouseleave="menuHide('misc')">
                            <a href="#">Misc <img src="https://fumbbl.com/FUMBBL/Images/Icons/disclosure.png"></a>
                            <ul class="submenu" v-show="mainMenuShow === 'misc'">
                                <li><a :href="`https://fumbbl.com/p/gallery3?team=${team.getId()}`">Change Image</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=editbio&amp;team_id=${team.getId()}`">Edit Bio</a></li>
                                <li><a :href="`https://fumbbl.com/p/team?op=reportteam&team_id=${team.getId()}`">Report</a></li>
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
                <div class="info">S{{ team.seasonInfo.currentSeason }} G{{ team.seasonInfo.gamesPlayedInCurrentSeason }}</div>
              </div>
              <div class="infobox">
                <div class="title">Record</div>
                <div class="info">{{team.record.wins}}/{{team.record.ties}}/{{team.record.losses}}</div>
              </div>
              <div class="infobox">
                <div class="title">Form</div>
                <div class="info">{{team.record.form}}</div>
              </div>
              <div class="infobox">
                <div class="title">TD / g</div>
                <div class="info">{{ (team.record.td.for / (team.record.games==0?1:team.record.games)).toFixed(2) }}</div>
              </div>
              <div class="infobox">
                <div class="title">Cas / g</div>
                <div class="info">{{ (team.record.cas.for / (team.record.games==0?1:team.record.games)).toFixed(2) }}</div>
              </div>
            </div>
        </div>

        <div class="container" :class="{showsidepanel: showSidePanel}">
          <div class="panel teamsheet" :class="{hidden: showSidePanel}" >
            <div v-if="accessControl.canCreate()" class="createteamstats">
                <div class="playerinfo">
                    <span class="currentplayercount">{{ team.getRosteredPlayers().length }}</span>
                    <span class="text">Players ({{ teamManagementSettings.startPlayers }} required)</span>
                    <span class="text">&bull;</span>
                    <span class="text">Treasury</span>
                    <span class="treasury">{{ team.treasury/1000 }}k</span>
                    <span class="text">&bull;</span>
                    <a href="#" @click.prevent="removeAllPlayers">Remove all players</a>
                </div>
                <div class="costinfo">
                    <div class="currentteamcostlabel">Treasury spent (Max {{ teamManagementSettings.startTreasury/1000 }}k)</div> <div class="currentteamcost">{{ teamCreationCost/1000 }}k</div>
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
                    <div class="errormessage"><template v-if="true">⚠ Not enough money to cover team cost.</template></div>
                </div>

                <div class="redraftactions">
                    <div class="restartredraft"><a href="#">Restart redraft</a> (clears all changes)</div>
                    <div class="finishredraft" v-if="true"><a href="#">Finish redraft</a> (saves your changes)</div>
                </div>
            </div>

            <div :class="{showhirerookies: showHireRookiesWithPermissionsCheck}">
                <hirerookies
                    v-if="showHireRookiesWithPermissionsCheck"
                    :roster-position-data-for-buying-player="rosterPositionDataForBuyingPlayer"
                    :roster-icon-manager="rosterIconManager"
                    :has-empty-team-sheet-entry="team.hasEmptyNumbers()"
                    :max-big-guys="teamManagementSettings.maxBigGuys"
                    @hire-rookie="handleHireRookie"
                    @hide-panel="enableShowHireRookies"
                ></hirerookies>
                <div class="playerrowsouter">
                    <div :class="{playerrows: true, showplayercontrols:team.getTeamStatus().showPlayerControls()}" >
                        <div class="playerrowsheader">
                            <template v-if="! showHireRookiesWithPermissionsCheck">
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
                                <div v-if="accessControl.canCreate()" class="cell removenewplayer"></div>
                                <div v-else-if="accessControl.canEdit()" class="cell removenewplayer"></div>
                            </template>
                            <template v-else>
                                <div class="cell">&nbsp;</div>
                            </template>
                        </div>

                        <SortableTable v-if="team.players !== undefined" :Items="team.players" :FootItems="team.extraPlayers" @onEnd="onPlayerRenumbered">
                          <template v-slot="prop">
                            <template v-if="!prop.item.empty">
                              <player :key="prop.item.key"
                                  :fumbbl-api="fumbblApi"
                                  :player="prop.item"
                                  :access-control="accessControl"
                                  :roster-icon-manager="rosterIconManager"
                                  :name-generator="teamManagementSettings.nameGenerator"
                                  :compact-view="showHireRookiesWithPermissionsCheck"
                                  :team-status="team.getTeamStatus()"
                                  @remove-player="handleRemovePlayer"
                                  @nominate-retire-player="handleNominateRetirePlayer"
                                  @hire-journeyman="handleHireJourneyman"
                                  @skill-player="showSkillPlayer"
                                  @fold-out="handleFoldOut"
                              ></player>
                            </template>
                            <template v-else>
                              <div></div>
                              <div>{{prop.item.number}}</div>
                              <div>Empty</div>
                            </template>
                          </template>
                        </SortableTable>
                    </div>
                    <div class="playerrowsfooter">
                        <div class="playercount">{{ team.countPlayersAvailableNextGame() }} players (+{{ team.countMissNextGamePlayers() }} players missing next game)</div>
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
            <div class="teammanagement" :class="{editteam: accessControl.canEdit()}">
                <div class="teammanagementrow">
                    <div class="title left">
                        Coach:
                    </div>
                    <div class="info left">
                        <a :href="'/~'+team.coach.name">{{ team.coach.name }}</a>
                    </div>
                    <div class="title right">
                        Re-Rolls ({{ rerollCostForMode/1000 }}k):
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
                            @remove-with-confirm="modals.removeReroll = true"
                            @remove-immediately="removeReroll"
                        ></addremove>
                    </div>
                </div>
                <div class="teammanagementrow">
                    <div class="title left">
                        Roster:
                    </div>
                    <div class="info left">
                        {{ teamManagementSettings.rosterName }}
                    </div>
                    <div class="title right">
                        Dedicated Fans:
                    </div>
                    <div class="info right">
                        <template v-if="accessControl.canCreate()">
                            <select v-model.number="dedicatedFansChoice">
                                <option v-for="dedicatedFansStartValue in teamManagementSettings.getDedicatedFansAllowedValues(team.getDedicatedFans(), team.treasury)" :key="dedicatedFansStartValue">{{ dedicatedFansStartValue }}</option>
                            </select>&nbsp;
                            <button v-if="dedicatedFansChoice != team.getDedicatedFans()" @click="updateDedicatedFans()" class="teambutton">Ok</button>
                        </template>
                        <template v-else>
                            {{ team.getDedicatedFans() }}
                        </template>
                    </div>
                </div>
                <div class="teammanagementrow">
                    <div class="title left">
                        Current Team Value:
                    </div>
                    <div class="info left">
                        {{ currentTeamValue/1000 }}k<span v-if="team.getTvLimitDisplay() !== 0"> (±{{ team.getTvLimitDisplay() }})</span>
                    </div>
                    <div class="title right">
                        Assistant Coaches:
                    </div>
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
                            @remove-with-confirm="modals.removeAssistantCoach = true"
                            @remove-immediately="removeAssistantCoach"
                        ></addremove>
                    </div>
                </div>
                <div class="teammanagementrow">
                    <div class="title left">
                        Treasury:
                    </div>
                    <div class="info left">
                        {{ team.treasury/1000 }}k
                    </div>
                    <div class="title right">
                        Cheerleaders:
                    </div>
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
                            @remove-with-confirm="modals.removeCheerleader = true"
                            @remove-immediately="removeCheerleader"
                        ></addremove>
                    </div>
                </div>
                <div class="teammanagementrow">
                    <div class="title left">
                        Team Value:
                    </div>
                    <div class="info left">
                        {{ teamValue/1000 }}k
                    </div>
                    <div class="title right">
                        Apothecary:
                    </div>
                    <div class="info right">
                        <addremove
                            :current-value="team.getApothecary() ? 'Yes' : 'No'"
                            :can-edit="accessControl.canEdit() && teamManagementSettings.apothecaryAllowed"
                            :can-remove-immediately="accessControl.canCreate()"
                            :can-add="addRemovePermissions.apothecary.add"
                            :can-remove="addRemovePermissions.apothecary.remove"
                            :label-add="accessControl.canCreate() ? 'Add' : 'Hire'"
                            :label-remove="accessControl.canCreate() ? 'Remove' : 'Fire'"
                            @add="addApothecary"
                            @remove-with-confirm="modals.removeApothecary = true"
                            @remove-immediately="removeApothecary"
                        ></addremove>
                    </div>
                </div>
                <div v-if="accessControl.canViewHistory()" class="teammanagementrow">
                    <div class="title left">
                        Games this Season:
                    </div>
                    <div class="info left">
                        {{ team.getGamesPlayedInSeason() }} / {{ teamManagementSettings.seasonLength }} <span v-if="team.getCurrentSeason() > 1"> (Season {{ team.getCurrentSeason() }})</span>
                    </div>
                    <div class="title right">
                        Current Re-draft Budget:
                    </div>
                    <div class="info right">
                        <div class=data>
                            todo
                        </div>
                        <div v-if="accessControl.canEdit()" class="editteamcontrols">
                            <!-- deliberately empty -->
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="accessControl.canCreate()" class="createteam">
                <div class="deleteteam">
                    <button @click="modals.deleteTeam = true" class="teambutton">Delete Team</button>
                </div>
            </div>
            <div v-if="accessControl.canRetireTeam()" class="retireteam">
                <button @click="modals.retireTeam = true" class="teambutton">Retire Team</button>
            </div>
          </div>
          <div class="panel sidepanel" :class="{hidden: !showSidePanel}" >
            <div v-show="sidePanel=='teamstats'" class="teamstats">
              <TeamStats ref="teamStats" @unexpected-error="triggerUnexpectedError" @close="showTeamPanel('main')" :team="team" :fumbblApi="fumbblApi"></TeamStats>
            </div>
            <div v-show="sidePanel=='teammatches'" class="teammatches">
              <TeamMatches ref="teamMatches" @unexpected-error="triggerUnexpectedError" @close="showTeamPanel('main')" :team="team" :fumbblApi="fumbblApi"></TeamMatches>
            </div>
          </div>
        </div>
        <modal
            v-if="errorModalInfo !== null"
            :button-settings="{cancel: {enabled: true, label: 'Close'}, confirm: {enabled: false, label: ''}}"
            :modal-size="'small'"
            @cancel="errorModalInfo = null"
        >
            <template v-slot:header>
                Error
            </template>

            <template v-slot:body>
                <p>{{ errorModalInfo.general }}</p>
                <p>Technical details: {{ errorModalInfo.technical }}</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeReroll === true"
            :button-settings="{cancel: {enabled: true, label: 'Cancel'}, confirm: {enabled: true, label: 'Remove'}}"
            :modal-size="'small'"
            @cancel="modals.removeReroll = false"
            @confirm="removeReroll"
        >
            <template v-slot:header>
                Discard reroll
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to discard this reroll? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeAssistantCoach === true"
            :button-settings="{cancel: {enabled: true, label: 'Cancel'}, confirm: {enabled: true, label: 'Remove'}}"
            :modal-size="'small'"
            @cancel="modals.removeAssistantCoach = false"
            @confirm="removeAssistantCoach"
        >
            <template v-slot:header>
                Discard assistant coach
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to discard this assistant coach? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeCheerleader === true"
            :button-settings="{cancel: {enabled: true, label: 'Cancel'}, confirm: {enabled: true, label: 'Remove'}}"
            :modal-size="'small'"
            @cancel="modals.removeCheerleader = false"
            @confirm="removeCheerleader"
        >
            <template v-slot:header>
                Discard cheerleader
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to discard this cheerleader? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.removeApothecary === true"
            :button-settings="{cancel: {enabled: true, label: 'Cancel'}, confirm: {enabled: true, label: 'Remove'}}"
            :modal-size="'small'"
            @cancel="modals.removeApothecary = false"
            @confirm="removeApothecary"
        >
            <template v-slot:header>
                Fire apothecary
            </template>

            <template v-slot:body>
                <p>Are you sure you wish to fire this apothecary? This cannot be undone.</p>
            </template>
        </modal>
        <modal
            v-show="modals.activateTeam === true"
            :button-settings="{cancel: {enabled: true, label: 'Oops, let me go back and check!'}, confirm: {enabled: true, label: 'Yes, my team complies'}}"
            :modal-size="'small'"
            @cancel="modals.activateTeam = false"
            @confirm="handleActivateTeam"
        >
            <template v-slot:header>
                * * * Important Notice * * *
            </template>

            <template v-slot:body>
                <p>Before you activate your team, please make sure your team complies with our <a href="https://fumbbl.com/note/Christer/NamesAndImages" target="_blank">Team Naming Policy</a>.</p>
                <p>Failure to follow these rules may result in your account being suspended for some time, depending on the severity of the transgression. The staff and the community are constantly monitoring teams and we do take this seriously. So, please make sure your team is in accordance with the rules before activating it.</p>
            </template>
        </modal>
        <modal
            v-show="modals.errorsForCreate === true"
            :button-settings="{cancel: {enabled: true, label: 'Close'}, confirm: {enabled: false, label: ''}}"
            :modal-size="'small'"
            @cancel="modals.errorsForCreate = false"
        >
            <template v-slot:header>
                Unable to create team.
            </template>

            <template v-slot:body>
                <p>Sorry we are unable to create your team, please review the errors listed below.</p>
                <ul>
                    <li v-for="error in teamManagementSettings.getErrorsForCreate(team)" :key="error">
                        <template v-if="error === 'teamNameBlank'">Team name is blank.</template>
                        <template v-if="error === 'insufficientTreasury'">Insufficient treasury for chosen players and sideline staff.</template>
                        <template v-if="error === 'insufficientPlayers'">Less than minimum required starting players selected.</template>
                    </li>
                </ul>
            </template>
        </modal>
        <modal
            v-show="modals.deleteTeam === true"
            :button-settings="{cancel: {enabled: true, label: 'Cancel'}, confirm: {enabled: true, label: 'Delete Team'}}"
            :modal-size="'small'"
            @cancel="modals.deleteTeam = false"
            @confirm="handleDeleteTeam"
        >
            <template v-slot:header>
                Delete team?
            </template>

            <template v-slot:body>
                <p>Are you sure you want to delete the following team?</p>
                <p>Team: <strong>{{ team.getName() }}</strong> {{ team.getTeamValue() / 1000 }}k ({{ teamManagementSettings.rosterName }})</p>
            </template>
        </modal>
        <modal
            v-show="modals.retireTeam === true"
            :button-settings="{cancel: {enabled: true, label: 'Cancel'}, confirm: {enabled: true, label: 'Retire Team'}}"
            :modal-size="'small'"
            @cancel="modals.retireTeam = false"
            @confirm="handleRetireTeam"
        >
            <template v-slot:header>
                Retire team?
            </template>

            <template v-slot:body>
                <p>Are you sure you want to retire the following team?</p>
                <p>Team: <strong>{{ team.getName() }}</strong> {{ team.getTeamValue() / 1000 }}k ({{ teamManagementSettings.rosterName }})</p>
            </template>
        </modal>
        <modal
            v-show="modals.skillPlayer === true"
            :button-settings="{cancel: {enabled: false}, confirm: {enabled: true, label: 'Close' }}"
            :modal-size="'skill'"
            @confirm="handleSkillPlayer"
        >
            <template v-slot:header>
                Skill Player
            </template>

            <template v-slot:body>
                <iframe v-if="modals.skillPlayer" style="border-radius: 5px; width:800px; height:496px" :src="'/p/selectskill?teamId='+team.id+'&playerId='+skillingPlayer.id" title="Select Skill"></iframe>
            </template>
        </modal>

        <modal
            ref="postMatchModal"
            class="postmatch"
            v-show="modals.readyTeam === true"
            :button-settings="{cancel: {enabled: true, label: 'Close'}, confirm: {enabled: !readyToPlayTriggered, label: 'Ready to Play' }}"
            :modal-size="'medium'"
            @cancel="modals.readyTeam = false"
            @confirm="triggerReadyToPlay"
        >
            <template v-slot:header>
                Complete Post-Match
            </template>

            <template v-slot:body>
              <div class="expensivemistakes">
                <div v-if="willTriggerExpensiveMistakes && !readyToPlayTriggered" class="warning">
                  <div class="paragraph">Treasury {{ team.treasury/1000 }}k is greater than {{ this.teamManagementSettings.expensiveMistakesStart/1000 }}k</div>
                  <div class="paragraph">Expensive mistakes will be triggered</div>
                </div>

                <div v-if="readyToPlayTriggered" class="warning emresult">
                  <div class="title">Expensive Mistakes</div>
                  <div class="emRoll">
                    <die type="d6" ref="emDie" @complete="completeExpensiveMistakes"></die>
                  </div>
                  <div v-if="showEmResult">{{ emResult }}</div>
                  <div v-if="showEmResult">Lost {{ emTreasuryLoss }}</div>
                </div>

              </div>
              <readytoplay
                  ref="readyToPlayComponent"
                  :class="{invisible: !accessControl.canReadyTeam() || readyToPlayTriggered}"
                  :journeymanQuantityForNextGame="journeymanQuantityForNextGame"
                  :journeymanPositions="teamManagementSettings.journeymanPositions"
                  @ready-to-play="handleReadyToPlay"
              ></readytoplay>
            </template>
        </modal>

        <retireplayer
            v-if="playerToRetire"
            :fumbblApi="fumbblApi"
            :player="playerToRetire"
            @nominate-retire-player-cancel="handleNominateRetirePlayerCancel"
            @nominate-retire-player-confirm="handleNominateRetirePlayerConfirm"
        ></retireplayer>
    </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import { Prop, Component, Vue, toNative, Emit, Ref } from 'vue-facing-decorator'
import { SortableTable, Die } from '@components/fumbblcomponents'
import {
    AddRemovePermissions,
    JourneymanQuantityChoice,
    PlayerGender,
    PositionDataForBuyingPlayer,
    RawApiSpecialRules,
    UserRole,
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

import { EventDataFoldOut, EventDataRemovePlayer } from "../include/EventDataInterfaces";

@Component({
    components: {
        'editteamname': EditTeamNameComponent,
        'player': PlayerComponent,
        'hirerookies': HireRookiesComponent,
        'specialrules': SpecialRulesComponent,
        'addremove': AddRemoveComponent,
        'modal': ModalComponent,
        'retireplayer': RetirePlayerComponent,
        'readytoplay': ReadyToPlayComponent,
        SortableTable,
        Die,
        TeamStats,
        TeamMatches
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

    @Emit('unexpected-error')
    public triggerUnexpectedError(errorMessage: string): string {
        return errorMessage;
    }

    @Emit('delete-team')
    public triggerDeleteTeam() {}

    @Ref
    private emDie: Die;

    @Ref
    private readyToPlayComponent: ReadyToPlayComponent;

    @Ref
    private postMatchModal: ModalComponent;

    @Ref
    private teamStats: TeamStats;
    @Ref
    private teamMatches: TeamMatches;

    private readonly MODIFICATION_RELOAD_DELAY: number = 5000;

    // the following properties (prefixed with data) must be initialized in order to become reactive data properties
    // to avoid warnings we provide getters for each without the data prefix, which also ignore the possibility of them being undefined
    public team: Team = undefined;
    public dataTeamManagementSettings?: TeamManagementSettings = undefined;
    public dataAccessControl?: AccessControl = undefined;
    public dataRosterIconManager?: RosterIconManager = undefined;

    private teamLastModifiedTimestamp: number = 0;
    private userRoles: UserRole[] = [];
    public editTeamNameInProgress: boolean = false;
    public dedicatedFansChoice: number = 0;
    public playerToRetire: Player | null = null;
    public rawApiSpecialRules: RawApiSpecialRules = {fromRoster: null, fromTeam: null};
    public mainMenuShow: string = 'none';
    private showHireRookies: boolean = false;
    public errorModalInfo: {general: string, technical: string} | null = null;
    private skillingPlayer: Player | null = null;
    private showEmResult: boolean = false;
    private emResult: string = '';
    private emTreasuryLoss: string = '';
    private readyToPlayTriggered: boolean = false;
    private teamSheetHidden: boolean = false;

    private sidePanel: string = "";
    private showSidePanel: bool = false;

    public modals: {
        activateTeam: boolean,
        errorsForCreate: boolean,
        deleteTeam: boolean,
        retireTeam: boolean,
        removeReroll: boolean,
        removeAssistantCoach: boolean,
        removeCheerleader: boolean,
        removeApothecary: boolean,
        skillPlayer: boolean,
        readyTeam: boolean,
    } = {
        activateTeam: false,
        errorsForCreate: false,
        deleteTeam: false,
        retireTeam: false,
        removeReroll: false,
        removeAssistantCoach: false,
        removeCheerleader: false,
        removeApothecary: false,
        skillPlayer: false,
        readyTeam: false,
    };

    public menuShow(menu: string) {
        this.mainMenuShow = menu;
    }

    public menuHide(menu: string) {
        this.mainMenuShow = 'none';
    }

    async mounted() {
        await this.reloadTeam();

        if (this.team.getCoach().name === this.coachName) {
            this.userRoles.push('OWNER');
        }

        this.dedicatedFansChoice = this.team.getDedicatedFans();

        // Reload the team when someone returns to the tab
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'visible') {
                this.reloadTeam();
            }
        });
    }

    private async showTeamPanel(panel: string) {
      this.mainMenuShow=''

      switch (panel) {
        case 'teamstats':
          await this.teamStats.loadStats();
          break;
        case 'teammatches':
          await this.teamMatches.loadMatches();
          break;
      }

      this.showSidePanel = panel != 'main';

      if (this.showSidePanel) {
        this.sidePanel = panel;
      }
    }

    private async reloadTeam() {
        const apiResponse = await this.fumbblApi.getTeam(this.teamId);
        if (apiResponse.isSuccessful()) {
            const rawApiTeam = apiResponse.getData();
            this.rawApiSpecialRules.fromTeam = rawApiTeam.specialRules;
            await this.setupForRulesetAndRoster(rawApiTeam.ruleset, rawApiTeam.roster.id);

            // Make sure that the same icon stays with the same player throughout the session
            const playerRosterIconVersionPositions: any = {};
            if (this.team) {
                for (const player of this.team.getPlayers()) {
                    playerRosterIconVersionPositions[player.getId()] = player.getIconRowVersionPosition();
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

            this.dataAccessControl = new AccessControl(this.userRoles, this.team.getTeamStatus().getStatus());


        } else {
            this.triggerUnexpectedError('Loading team information: ' + apiResponse.getErrorMessage());
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

    private async recoverFromUnexpectedError(generalErrorMessage: string, technicalErrorMessage: string) {
        this.errorModalInfo = {
            general: generalErrorMessage,
            technical: technicalErrorMessage,
        }
        await this.reloadTeam();
    }

    private async setupForRulesetAndRoster(rulesetId: number, rosterId: number) {
        // Prevent this basic set up from running more than once
        if (this.teamManagementSettings !== null && this.rawApiSpecialRules.fromRoster !== null && this.rosterIconManager !== null) {
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
                if (specialRule.name === 'Low Cost Linemen') {
                    hasLowCostLinemen = true;
                }
            }

            await this.setupRosterIconManager(rawApiRoster.positions);
            this.dataTeamManagementSettings = new TeamManagementSettings(rawApiRuleset, rawApiRoster, hasLowCostLinemen);
        } else {
            let currentAction = '';
            let errorMessage = '';
            if (! apiResponseRuleset.isSuccessful()) {
                currentAction = 'Loading ruleset information';
                errorMessage = apiResponseRuleset.getErrorMessage();
            } else {
                currentAction = 'Loading roster information';
                errorMessage = apiResponseRoster.getErrorMessage();
            }
            this.triggerUnexpectedError(currentAction + ': ' + errorMessage);
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
        return this.team !== undefined &&
            this.dataTeamManagementSettings !== undefined &&
            this.dataAccessControl !== undefined &&
            this.dataRosterIconManager !== undefined;
    }

    public get team2(): Team {
        return this.dataTeam!;
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
        const positionQuantities: {positionId: number, quantity: number}[] = [];

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

    public get gamesPlayedStatDisplay(): string {
        return '0 (0/0/0)'; // todo
    }

    public get tdDiffStatDisplay(): string {
        return '0 (0 - 0)'; // todo
    }

    public get casDiffStatDisplay(): string {
        return '0 (0/0/0 - 0/0/0)'; // todo
    }

    public get lastPlayedTeamData(): {id: number, name: string} {
        return {
            id: 10000000000,
            name: 'Todo United',
        };
    }

    public get addRemovePermissions(): AddRemovePermissions {
        return this.teamManagementSettings.getAddRemovePermissions(this.team);
    }

    public get divisionLogoImageUrl(): string {
        if (this.team.isCompetitiveDivision()) {
            return 'https://fumbbl.com/i/677766';
        } else if (this.team.isLeagueDivision()) {
            return 'https://fumbbl.com/FUMBBL/Images/Icons/league.png';
        } else {
            return 'https://fumbbl.com/FUMBBL/Images/Race/unknown_196.png';
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
        const playerDeficit = this.teamManagementSettings.startPlayers - this.team.countPlayersAvailableNextGame();
        return playerDeficit < 0 ? 0 : playerDeficit;
    }

    public async onPlayerRenumbered(evt) {
      var newNumbers = {};
      this.team.players.filter(p => !p.IsEmpty).forEach(p => newNumbers[p.id] = p.playerNumber);
      const apiResponse = await this.fumbblApi.renumberPlayers(this.team.id, newNumbers);
      if (!apiResponse.isSuccessful()) {
         await this.recoverFromUnexpectedError(
             'An error occurred whilst renumbering your players.',
             apiResponse.getErrorMessage(),
         );
         return;
      }
    }

    public async removeAllPlayers() {
        const playerIdsToRemove = this.team.getPlayers().filter(p => !p.IsEmpty).map(player => player.id);
        this.team.removeAllPlayers();
        // call this to immediately show the players have gone (handleGeneralTeamUpdate needs to be called after all have been fully removed).


        for (const playerId of playerIdsToRemove) {
            const apiResponse = await this.fumbblApi.removePlayer(this.team.getId(), playerId);
            if (! apiResponse.isSuccessful()) {
                await this.recoverFromUnexpectedError(
                    'An error occurred removing a player whilst removing all players from team.',
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
        this.team.updateDedicatedFans(this.dedicatedFansChoice, this.teamManagementSettings.dedicatedFansCost);
        this.reloadTeamWithDelay();

        const apiResponse = await this.fumbblApi.setDedicatedFans(this.team.getId(), this.dedicatedFansChoice);
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred setting dedicated fans.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async addReroll() {
        this.team.addReroll(
            this.team.getTeamStatus().isNew() ? this.teamManagementSettings.rerollCostOnCreate : this.teamManagementSettings.rerollCostFull
        );
        this.reloadTeamWithDelay();

        const apiResponse = await this.fumbblApi.addReroll(this.team.getId());
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred adding a reroll.',
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
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred removing a reroll.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async addAssistantCoach() {
        this.team.addAssistantCoach(this.teamManagementSettings.assistantCoachCost);
        this.reloadTeamWithDelay();

        const apiResponse = await this.fumbblApi.addAssistantCoach(this.team.getId());
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred adding an assistant coach.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async removeAssistantCoach() {
        this.team.removeAssistantCoach(this.teamManagementSettings.assistantCoachCost);
        this.modals.removeAssistantCoach = false;
        this.reloadTeamWithDelay();

        let apiResponse = null;
        if (this.accessControl.canCreate()) {
            apiResponse = await this.fumbblApi.removeAssistantCoach(this.team.getId());
        } else {
            apiResponse = await this.fumbblApi.fireAssistantCoach(this.team.getId());
        }
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred removing an assistant coach.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async addCheerleader() {
        this.team.addCheerleader(this.teamManagementSettings.cheerleaderCost);
        this.reloadTeamWithDelay();

        const apiResponse = await this.fumbblApi.addCheerleader(this.team.getId());
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred adding a cheerleader.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async removeCheerleader() {
        this.team.removeCheerleader(this.teamManagementSettings.cheerleaderCost);
        this.modals.removeCheerleader = false;
        this.reloadTeamWithDelay();

        let apiResponse = null;
        if (this.accessControl.canCreate()) {
            apiResponse = await this.fumbblApi.removeCheerleader(this.team.getId());
        } else {
            apiResponse = await this.fumbblApi.fireCheerleader(this.team.getId());
        }
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred removing a cheerleader.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async addApothecary() {
        this.team.addApothecary(this.teamManagementSettings.apothecaryCost);
        this.reloadTeamWithDelay();

        const apiResponse = await this.fumbblApi.addApothecary(this.team.getId());
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred adding an apothecary.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async removeApothecary() {
        this.team.removeApothecary(this.teamManagementSettings.apothecaryCost);
        this.modals.removeApothecary = false;
        this.reloadTeamWithDelay();

        let apiResponse = null;
        if (this.accessControl.canCreate()) {
            apiResponse = await this.fumbblApi.removeApothecary(this.team.getId());
        } else {
            apiResponse = await this.fumbblApi.fireApothecary(this.team.getId());
        }
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred removing an apothecary.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public enableShowHireRookies(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showHireRookies = ! this.showHireRookies;
    }

    private getGender(defaultGender: string): PlayerGender {
        const availableGenders: PlayerGender[] = ['FEMALE', 'MALE', 'NEUTRAL', 'NONBINARY'];
        if (availableGenders.includes(defaultGender.toUpperCase() as PlayerGender)) {
            return defaultGender.toUpperCase() as PlayerGender;
        }
        return availableGenders[Math.floor(Math.random()*availableGenders.length)];
    }

    public async handleRemovePlayer(eventDataRemovePlayer: EventDataRemovePlayer) {
        const player = this.team.findPlayerByNumber(eventDataRemovePlayer.teamSheetEntryNumber);
        if (player === null || player.id !== eventDataRemovePlayer.playerId) {
            await this.recoverFromUnexpectedError(
                'Unable to remove player, if this problem continues please reload the page.',
                `Removing playerId ${eventDataRemovePlayer.playerId} from number ${eventDataRemovePlayer.teamSheetEntryNumber} but found playerId ${player ? player.id : 'empty'}`,
            );
            return;
        }

        this.team.removePlayer(player);

        this.reloadTeamWithDelay();

        const apiResponse = await this.fumbblApi.removePlayer(this.team.id, player.id);
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred removing a player.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public handleNominateRetirePlayer(player: Player) {
        this.playerToRetire = player;
    }

    public handleNominateRetirePlayerCancel() {
        this.playerToRetire = null;
    }

    public async handleNominateRetirePlayerConfirm() {
        if (! this.playerToRetire) {
            return;
        }

        this.team.removePlayer(this.playerToRetire);

        this.reloadTeamWithDelay();

        const playerToRetireId = this.playerToRetire.id;
        this.playerToRetire = null;

        const apiResponse = await this.fumbblApi.retirePlayer(this.team.id, playerToRetireId);
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred retiring a player.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async handleHireJourneyman(player: Player) {
        const firstEmptyNumber = this.team.findFirstEmptyNumber();
        if (! firstEmptyNumber) {
            return;
        }

        player.permanentlyHireJourneyman(firstEmptyNumber);

        this.reloadTeamWithDelay();

        const apiResponse = await this.fumbblApi.hireJourneyman(this.team.getId(), player.getId());
        if (! apiResponse.isSuccessful()) {
            await this.recoverFromUnexpectedError(
                'An error occurred permanently hiring a journeyman.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    public async interceptReadyToPlay() {
      if (this.willTriggerExpensiveMistakes || (this.journeymanQuantityForNextGame > 0 && this.teamManagementSettings.journeymanPositions.length > 1)) {
        this.showEmResult = false;
        this.readyToPlayTriggered = false;
        this.modals.readyTeam = true;
      } else {
        this.team.setTeamStatus('Active');
        this.triggerReadyToPlay();
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
        let playerNumber = eventDataFoldOut.teamSheetEntryNumber;

        if (playerRowFoldOutMode !== 'CLOSED' && ! multipleOpenMode) {
            this.team.players.forEach(player => {
                player.foldOut = 'CLOSED';
            });
        }

        const player = this.findPlayer(playerNumber);
        player.foldOut = playerRowFoldOutMode;
    }

    public findPlayer(number: number) {
      return this.team.players.find(p => p.playerNumber === number);
    }

    public async handleHireRookie(positionId: number) {
        const firstEmptyNumber = this.team.findFirstEmptyNumber();
        if (! firstEmptyNumber) {
            return;
        }

        const position = this.teamManagementSettings.getPosition(positionId);
        const gender = this.getGender(position.defaultGender);
        const iconRowVersionPosition = this.rosterIconManager.getNextAvailableIconRowVersionPosition(
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

        const apiResponsePlayerName = await this.fumbblApi.generatePlayerName(this.teamManagementSettings.nameGenerator, gender);

        if (! apiResponsePlayerName.isSuccessful()) {
            this.team.removeTemporaryPlayers();
            await this.recoverFromUnexpectedError(
                'An error occurred when generating a player name.',
                apiResponsePlayerName.getErrorMessage(),
            );
            return;
        }

        const playerName = apiResponsePlayerName.getData();
        temporaryPlayer.setPlayerName(playerName);

        const apiResponse = await this.fumbblApi.addPlayer(this.team.getId(), positionId, gender, playerName);
        if (apiResponse.isSuccessful()) {
            const newPlayerResponseData: {playerId: number, number: number} = apiResponse.getData();
            temporaryPlayer.setIdForTemporaryPlayer(newPlayerResponseData.playerId);

            //this.reloadTeamWithDelay();
            if (temporaryPlayer.playerNumber !== newPlayerResponseData.number) {
                await this.recoverFromUnexpectedError(
                    'Your player has been purchased but your team page is out of sync with the latest version on the server. Please refresh the page if this problem continues.',
                    `Expected player number ${temporaryPlayer.playerNumber}, got ${newPlayerResponseData.number}`,
                );
            }
        } else {
            this.team.removeTemporaryPlayers();
            await this.recoverFromUnexpectedError(
                'An error occurred buying a new player.',
                apiResponse.getErrorMessage(),
            );
        }
    }

    private buyTemporaryPlayer(number: number, position: Position, iconRowVersionPosition: number, playerGender: PlayerGender): Player {
        const temporaryPlayer = Player.temporaryPlayer(
            number,
            position,
            iconRowVersionPosition,
            playerGender,
        );
        this.team.buyPlayer(temporaryPlayer);
        return this.team.players[number-1]; // Return the reactive version of the player
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
        const apiResponse = await this.fumbblApi.renameTeam(this.team.getId(), newTeamName);
        if (! apiResponse.isSuccessful()) {
            this.team.setName(originalTeamName);
            await this.recoverFromUnexpectedError('Unable to rename team.', apiResponse.getErrorMessage());
        }
        this.reloadTeamWithDelay();
        this.editTeamNameInProgress = false;
    }

    public async handleActivateTeam() {
        const apiResponse = await this.fumbblApi.activateTeam(this.team.id);
        if (apiResponse.isSuccessful()) {
            await this.reloadTeam();
            this.modals.activateTeam = false;
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 500);
        } else {
            this.modals.activateTeam = false;
            await this.recoverFromUnexpectedError('An error occurred activating your team.', apiResponse.getErrorMessage());
        }
    }

    public async handleDeleteTeam() {
        const apiResponse = await this.fumbblApi.deleteTeam(this.team.getId());
        if (apiResponse.isSuccessful()) {
            this.modals.deleteTeam = false;
            this.triggerDeleteTeam();
        } else {
            this.modals.deleteTeam = false;
            await this.recoverFromUnexpectedError('An error occurred deleting your team.', apiResponse.getErrorMessage());
        }
    }

    public async handleRetireTeam() {
        const apiResponse = await this.fumbblApi.retireTeam(this.team.getId());
        if (apiResponse.isSuccessful()) {
            await this.reloadTeam();
            this.modals.retireTeam = false;
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 500);
        } else {
            this.modals.retireTeam = false;
            await this.recoverFromUnexpectedError('An error occurred retiring your team.', apiResponse.getErrorMessage());
        }
    }

    public async handleReadyToPlay(journeymanQuantityChoices: JourneymanQuantityChoice[]) {
        let postData = {
          journeymen: journeymanQuantityChoices
        };
        const apiResponse = await this.fumbblApi.readyTeam(this.team.id, postData);

        if (apiResponse.isSuccessful()) {
          const emResult: any = apiResponse.getData();
          if (emResult != undefined && emResult.expensiveMistakes != undefined) {
            let roll = emResult.expensiveMistakes.roll;
            this.emResult = emResult.expensiveMistakes.effect;
            this.emTreasuryLoss = emResult.expensiveMistakes.treasuryLoss;

            this.emDie.roll(roll);
          } else {
            this.modals.readyTeam = false;
            await this.reloadTeam();
          }

        } else {
            await this.recoverFromUnexpectedError('An error occurred readying your team.', apiResponse.getErrorMessage());
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
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 500);
    }

    public get willTriggerExpensiveMistakes() {
      return this.team.treasury >= this.teamManagementSettings.expensiveMistakesStart;
    }
}

export default toNative(TeamComponent);
</script>