<template>
  <div class="container" id="vuecontent">
    <PageHeader
      ref="nav"
      :navItems="navItems"
      defaultPage="squadStandings"
      @setPage="setPage"
      :enableUrlNav="true"
    >
      <template #pagename
        >Blackbox Trophy
        <SeasonPicker
          :seasons="seasons"
          :selectedSeason="selectedSeason"
          @changeSeason="loadSeasonData"
        ></SeasonPicker>
      </template>
      <template #center>
        <Progress ref="progress" :season="selectedSeason"></Progress>
      </template>
    </PageHeader>

    <div class="panel" v-if="page == 'rules' && selectedSeason != null">
      <TitledPanel>
        <template #header>Rules</template>
        <template #content>
          <div class="rules">
            <p>
              The Blackbox Trophy is a meta-event run in the Competitive
              division. Coaches put together a squad of teams within a set of
              constraints, and play games with these teams using the Blackbox
              scheduler.
            </p>
            <p>
              At the end of a season, the winner is the coach who managed to get
              the highest total points for their squad.
            </p>
            <p>
              The Blackbox Trophy also functions as a qualifier for the
              <a href="/p/group&group=16444&op=view">Steel Gauntlet</a> major
              tournament.
            </p>
          </div>
          <div class="twocolumn">
            <div class="column">
              <div class="section">Squad Limits</div>
              <div>
                Number of teams per squad: {{ selectedSeason.numTeams }}
              </div>
              <div>Squad budget: {{ selectedSeason.totalTeamCost }} points</div>
              <div>&nbsp;</div>
              <div>
                Multiple squads are allowed each season, but each roster can
                only appear once across the squads.
              </div>
              <div>&nbsp;</div>
              <div>
                Teams in a squad are forced into 'Blackbox Only' mode for the
                duration of the trophy.
              </div>
            </div>
            <div class="column">
              <div class="section">Scoring</div>
              <div>
                <ul class="scorelist">
                  <li class="item">
                    A maximum of {{ selectedSeason.gamesPerTeam }} games are
                    scored per team.
                  </li>
                  <li class="item">
                    A win gives 1 point, a tie gives 0.5 points, and a loss
                    gives 0 points.
                  </li>
                  <li class="item">
                    An additional {{ selectedSeason.unusedCostPoints }}
                    {{
                      selectedSeason.unusedCostPoints == 1
                        ? "point is"
                        : "points are"
                    }}
                    awarded per point of unused team budget.
                  </li>
                  <li class="item">
                    Having a team with the highest points for that roster awards
                    {{ selectedSeason.raceLeadPoints }} additional points.
                  </li>
                  <li class="item">
                    A bonus of {{ selectedSeason.bonusScore }}
                    {{
                      selectedSeason.bonusScore == 1 ? "point is" : "points are"
                    }}
                    given for every {{ selectedSeason.matchesForBonus }} games
                    played per team.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </template>
      </TitledPanel>
      <TitledPanel id="seasons">
        <template #header> Tiers </template>
        <template #content>
          <div class="tiers">
            <template v-for="tier in seasonData" :key="tier.tier">
              <div class="tierwrap">
                <div class="tier">
                  Tier {{ tier.tier }} (Cost {{ tier.cost }})
                </div>
                <template v-for="roster in tier.rosters" :key="roster.id">
                  <RosterBox :roster="roster"></RosterBox>
                </template>
              </div>
            </template>
          </div>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="designate" v-if="page == 'designate'">
      <div class="info">
        <div class="description">
          Each roster can be designated into a squad once per season.
        </div>

        <div
          class="info"
          v-if="
            coachStatus != null &&
            coachStatus.filter((x: any) => x.used).length > 0
          "
        >
          These are the rosters you have already used this season:
        </div>
        <template v-for="status in coachStatus" :key="status.roster.id">
          <img
            v-if="status.used"
            :title="status.roster.name"
            :src="'https://fumbbl.com/i/' + status.roster.logos[0].logo"
          />
        </template>
      </div>

      <TitledPanel>
        <template #header>Choose your squad</template>
        <template #content>
          <table>
            <thead>
              <tr class="columns">
                <th colspan="2">Team</th>
                <th>Roster</th>
                <th class="right" width="10%">Cost</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="team in designateTeams" :key="team.teamId">
                <tr v-if="allowRoster(team.rosterId)">
                  <td width="1%">
                    <input
                      :id="'Team-' + team.id"
                      type="checkbox"
                      v-model="checkedTeams"
                      :value="team"
                    />
                  </td>
                  <td>
                    <label class="label" :for="'Team-' + team.id">{{
                      team.name
                    }}</label>
                  </td>
                  <td>
                    <img
                      class="rosterlogo"
                      :src="'https://fumbbl.com/i/' + team.logo"
                    />
                    {{ team.race }}
                  </td>
                  <td class="right">{{ getRosterCost(team) }}</td>
                </tr>
              </template>
              <tr>
                <td class="errorMessage" colspan="2" align="left">
                  {{ getSquadError() }}
                </td>
                <td colspan="2" align="right">
                  Total cost: {{ getTotalSquadCost() }}
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </TitledPanel>
      <div class="controlpanel">
        <button v-if="getSquadError().length == 0" @click="designateSquad()">
          Designate Squad
        </button>
      </div>
    </div>

    <div class="panel" id="recentmatches" v-if="page == 'recentMatches'">
      <TitledPanel>
        <template #header> Recent Matches </template>
        <template #content>
          <a
            :href="matchLink(match.id)"
            class="match"
            v-for="match in recentMatches"
            :key="match.id"
          >
            <div class="home team">
              <img :src="'https://fumbbl.com/i/' + match.home.logo64" />
              <div class="name">
                <div v-if="isParticipant(match.home.coach)" class="tag">
                  BBT
                </div>
                <a :href="teamLink(match.home)">{{ match.home.team }}</a>
              </div>
              <div class="roster">
                CTV {{ match.home.ctv / 1000 }}k {{ match.home.race }}
              </div>
              <div class="coach">
                ({{ match.home.ratingBracket }})
                <a :href="coachLink(match.home.coach)">{{
                  match.home.coach
                }}</a>
              </div>
            </div>
            <div class="score">
              {{ match.home.score }} - {{ match.away.score }}
              <br />
              <a :href="match.replayLink">Replay</a>
            </div>
            <div class="away team">
              <div class="name">
                <a :href="teamLink(match.away)">{{ match.away.team }}</a>
                <div v-if="isParticipant(match.away.coach)" class="tag">
                  BBT
                </div>
              </div>
              <div class="roster">
                {{ match.away.race }} CTV {{ match.away.ctv / 1000 }}k
              </div>
              <div class="coach">
                <a :href="coachLink(match.away.coach)">{{
                  match.away.coach
                }}</a>
                ({{ match.away.ratingBracket }})
              </div>
              <img :src="'https://fumbbl.com/i/' + match.away.logo64" />
            </div>
          </a>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="mysquads" v-if="page == 'mySquads'">
      <div class="join" v-if="showPlayoffControls || squads.length == 0">
        <div v-if="!showPlayoffControls && squads.length == 0">
          To join, create your {{ selectedSeason.numTeams }} competitive
          division teams and click the button below to sign up.
        </div>

        <div v-if="showPlayoffControls">
          This view lets you choose which teams you would want to join the Steel
          Gauntlet playoffs with. Note that saying 'Yes' here does not guarantee
          a spot, but will just make your team eligible. An undecided team will
          count as declining offered spots.
        </div>
      </div>

      <div
        v-if="!showPlayoffControls && started && !ended"
        class="controlpanel center"
      >
        <button @click="setPage('playoffSettings')" v-if="squads.length > 0">
          Playoff Settings
        </button>
        <button @click="setPage('designate')">Designate new squad</button>
      </div>

      <TitledPanel>
        <template #header>My Squads</template>
        <template #content>
          <table>
            <thead>
              <tr class="columns">
                <th colspan="2">&nbsp;</th>
                <th v-if="!showPlayoffControls" class="right">Roster Leads</th>
                <th v-if="!showPlayoffControls" class="right" width="10%">
                  Games
                </th>
                <th v-if="!showPlayoffControls" class="right" width="10%">
                  Record
                </th>
                <th v-if="!showPlayoffControls" class="right" width="10%">
                  Score
                </th>
                <th v-if="!showPlayoffControls" class="right" width="10%">
                  Roster Lead
                </th>
                <th v-if="!showPlayoffControls" class="right" width="10%">
                  Best Possible
                </th>
                <th colspan="2" v-if="showPlayoffControls" class="right">
                  Apply for Playoffs
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="squad in squads">
                <tr
                  v-if="squad.name == coachName"
                  :class="{ friend: squad.friend }"
                  :key="squad.id"
                >
                  <td class="pos">{{ getPosition(squad.score) }}.</td>
                  <td
                    :class="['name', { self: squad.name == coachName }]"
                    @click="showSquadRenameControl(squad)"
                  >
                    {{ squad.squad }}
                  </td>
                  <td v-if="!showPlayoffControls" class="racelead">
                    <img
                      v-for="rl in squad.raceleads"
                      :src="'https://fumbbl.com/i/' + rl"
                      :key="rl"
                    />
                  </td>
                  <td v-if="!showPlayoffControls" class="right">
                    {{ squad.games }}
                  </td>
                  <td v-if="!showPlayoffControls" class="right record">
                    {{ getRecord(squad.teams) }}
                  </td>
                  <td v-if="!showPlayoffControls" class="right bold">
                    {{ squad.score.toFixed(1) }}
                  </td>
                  <td v-if="!showPlayoffControls">&nbsp;</td>
                  <td v-if="!showPlayoffControls" class="right">
                    {{ getBestPossible(squad.teams).toFixed(1) }}
                  </td>
                  <td v-if="showPlayoffControls" colspan="2" class="right">
                    &nbsp;
                  </td>
                </tr>
                <template v-if="squad.name == coachName">
                  <tr class="team" v-for="team in squad.teams" :key="team.id">
                    <td colspan="3">
                      <img
                        :src="'https://fumbbl.com/i/' + team.logo"
                        :title="team.race"
                      />
                      <a :href="teamLink(team)">{{ team.name }}</a>
                    </td>
                    <td v-if="!showPlayoffControls" class="right">
                      {{ team.games }}
                    </td>
                    <td v-if="!showPlayoffControls" class="right">
                      {{ team.wins }} / {{ team.ties }} / {{ team.losses }}
                    </td>
                    <td v-if="!showPlayoffControls" class="right bold">
                      {{ team.score.toFixed(1) }}
                    </td>
                    <td v-if="!showPlayoffControls" class="right">
                      {{ rosterLeadScores[team.race].toFixed(1) }}
                    </td>
                    <td v-if="!showPlayoffControls" class="right">
                      {{ getBestForTeam(team).toFixed(1) }}
                    </td>
                    <td v-if="showPlayoffControls" class="right">
                      <Trinary
                        :name="team.id"
                        :state="getPlayoffState(team)"
                        @stateChanged="playoffChanged"
                      />
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="playoffSettings" v-if="page == 'playoffSettings'">
      <div class="titlepanel">
        Set priorities for which teams you'd prefer to enter the Steel Gauntlet
        tournament. Drag teams to set priorities. The topmost team will be
        highest priority. Note that this does not guarantee a spot.
      </div>

      <TitledPanel>
        <template #header>My Teams</template>
        <template #content>
          <SortableTable
            :Items="teams"
            @onEnd="onTeamMoved"
            :key="teamPriority"
          >
            <template v-slot="prop">
              <div class="teamrow handle">
                <div>
                  <img
                    :src="'https://fumbbl.com/i/' + prop.item.logo"
                    :title="prop.item.race"
                  />
                  <a :href="teamLink(prop.item)">{{ prop.item.team }}</a>
                </div>
                <div class="playoffstate">
                  <Trinary
                    :name="prop.item.id"
                    :state="getPlayoffState(prop.item)"
                    @stateChanged="playoffChanged"
                  />
                </div>
              </div>
            </template>
          </SortableTable>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="stats" v-if="page == 'statistics'">
      <TitledPanel>
        <template #header>Season Statistics</template>
        <template #content>
          <table>
            <thead>
              <tr class="columns">
                <th colspan="2">Roster</th>
                <th class="right">Teams</th>
                <th class="right">Total<br />Games</th>
                <th class="right">Total<br />Score</th>
                <th class="right">Score<br />per Game</th>
                <th class="right">Roster<br />Lead</th>
                <th class="right">Average<br />Total Value</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="stat in stats" :key="stat.roster">
                <tr>
                  <td><img :src="'https://fumbbl.com/i/' + stat.logo" /></td>
                  <td class="rostername">
                    {{ stat.roster }}
                    <div class="rostercost">Cost: {{ stat.rosterCost }}</div>
                  </td>
                  <td class="right">{{ stat.numTeams }}</td>
                  <td class="right">{{ stat.totalGames }}</td>
                  <td class="right">{{ stat.totalScore }}</td>
                  <td class="right">{{ stat.scorePerGame.toFixed(2) }}</td>
                  <td class="right">
                    {{ stat.bestScorePerGame.toFixed(1) }}
                  </td>
                  <td class="right">
                    <div class="bold">
                      {{ stat.expectedResult.toFixed(2) }}
                    </div>
                    <div class="stdev">{{ stat.scoreStDev.toFixed(2) }}</div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" id="standings" v-if="page == 'squadStandings'">
      <TitledPanel>
        <template #header>Squad Standings</template>
        <template #content>
          <table>
            <thead>
              <tr class="columns">
                <th colspan="3">Coach</th>
                <th class="right">Roster Leads</th>
                <th class="right" width="10%">Games</th>
                <th class="right" width="10%">Record</th>
                <th class="right" width="10%">Score</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="squad in squads" :key="squad.id">
                <tr
                  :class="{ coach: true, friend: squad.friend }"
                  v-on:click="expand(squad.name)"
                >
                  <td class="pos">{{ getPosition(squad.score) }}.</td>
                  <td class="disclosure">
                    <span v-if="expanded == squad.name">&#x25bc;</span>
                    <span v-else>&#x25b6;</span>
                  </td>
                  <td :class="['name', { self: squad.name == coachName }]">
                    {{ squad.name
                    }}{{
                      squad.squad != "Unnamed Squad" ? " - " + squad.squad : ""
                    }}
                    <span class="squadCost">(Cost {{ squad.totalCost }})</span>
                  </td>
                  <td class="racelead">
                    <img
                      v-for="rl in squad.raceleads"
                      :src="'https://fumbbl.com/i/' + rl"
                      :key="rl"
                    />
                  </td>
                  <td class="right">{{ squad.games }}</td>
                  <td class="right">{{ getRecord(squad.teams) }}</td>
                  <td class="right">{{ squad.score.toFixed(1) }}</td>
                </tr>
                <template v-if="expanded == squad.name">
                  <tr class="team" v-for="team in squad.teams" :key="team.id">
                    <td colspan="4">
                      <img
                        :src="'https://fumbbl.com/i/' + team.logo"
                        :title="team.race"
                      />
                      <a :href="teamLink(team)">{{ team.name }}</a>
                    </td>
                    <td class="right">{{ team.games }}</td>
                    <td class="right">
                      {{ team.wins }} / {{ team.ties }} / {{ team.losses }}
                    </td>
                    <td class="right">{{ team.score.toFixed(1) }}</td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </template>
      </TitledPanel>

      <div v-if="squads.length > 0">{{ squads.length }} squads signed up.</div>
    </div>

    <div class="panel" id="teamstandings" v-if="page == 'teamStandings'">
      <div class="toolbar">
        <select :value="teamFilter" @change="changeTeamStandingFilter($event)">
          <option value="All">All Teams</option>
          <option value="Qualifying" v-if="enableQualifier">
            Qualifying Teams
          </option>
          <option value="Eligible" v-if="enableQualifier">
            Eligible Teams
          </option>
          <option disabled="true">---</option>
          <option>Amazon</option>
          <option>Black Orc</option>
          <option>Chaos Chosen</option>
          <option>Chaos Dwarf</option>
          <option>Chaos Renegade</option>
          <option>Dark Elf</option>
          <option>Dwarf</option>
          <option>Elven Union</option>
          <option>Gnome</option>
          <option>Goblin</option>
          <option>Halfling</option>
          <option>High Elf</option>
          <option>Human</option>
          <option>Imperial Nobility</option>
          <option>Khorne</option>
          <option>Lizardmen</option>
          <option>Necromantic Horror</option>
          <option>Norse</option>
          <option>Nurgle</option>
          <option>Ogre</option>
          <option>Old World Alliance</option>
          <option>Orc</option>
          <option>Shambling Undead</option>
          <option>Skaven</option>
          <option>Snotling</option>
          <option>Tomb Kings</option>
          <option>Underworld Denizens</option>
          <option>Vampire</option>
          <option>Wood Elf</option>
        </select>
      </div>
      <TitledPanel>
        <template #header>
          Team Standings <span class="remaining">(min 5 games)</span>
        </template>
        <template #content>
          <table>
            <thead>
              <tr class="columns">
                <th>&nbsp;</th>
                <th>Coach</th>
                <th>Roster</th>
                <th>Team</th>
                <th class="right" width="10%">G</th>
                <th class="right" width="10%">Team<br />Score</th>
                <th class="right" width="10%">Squad<br />Score</th>
                <th class="right" width="10%">Record</th>
                <th class="right" width="10%" v-if="enableQualifier">
                  <a href="#" @click.prevent="showQualifyHelp()">Qlfy</a>
                </th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="(team, index) in visibleTeams(teams)"
                :key="team.id"
              >
                <tr class="team">
                  <td class="right">{{ index + 1 }}</td>
                  <td>
                    <a :href="coachLink(team.coach)">{{ team.coach }}</a>
                  </td>
                  <td class="roster">{{ team.roster }}</td>
                  <td class="teamName">
                    <a :href="teamLink(team)">{{ team.team }}</a>
                  </td>
                  <td class="right">{{ team.games.toFixed(0) }}</td>
                  <td class="right">{{ team.teamScore.toFixed(1) }}</td>
                  <td class="right">{{ team.squadScore.toFixed(1) }}</td>
                  <td class="right">
                    {{ team.wins }} / {{ team.ties }} / {{ team.losses }}
                  </td>
                  <td
                    class="right"
                    v-if="enableQualifier"
                    v-html="getQualifierState(team)"
                  ></td>
                </tr>
              </template>
            </tbody>
          </table>
        </template>
      </TitledPanel>
    </div>

    <div class="panel" v-if="page == 'config'">
      <TitledPanel id="seasons">
        <template #header> Seasons </template>
        <template #content>
          <div id="seasonTable">
            <div class="row header">
              <div>Season</div>
              <div>Start</div>
              <div>End</div>
              <div>Teams</div>
              <div>Budget</div>
              <div>Score per<br />Unused</div>
              <div>Games</div>
              <div>Matches for<br />Bonus</div>
              <div>Bonus</div>
              <div>Race Lead</div>
            </div>
            <template v-for="season in seasons" :key="season.id">
              <div
                class="row data"
                @click="selectSeason(season)"
                :class="{ current: season.isActive }"
              >
                <div>{{ season.season }}</div>
                <div>{{ season.start }}</div>
                <div>{{ season.end }}</div>
                <div>{{ season.numTeams }}</div>
                <div>{{ season.totalTeamCost }}</div>
                <div>{{ season.unusedCostPoints }}</div>
                <div>{{ season.gamesPerTeam }}</div>
                <div>{{ season.matchesForBonus }}</div>
                <div>{{ season.bonusScore }}</div>
                <div>{{ season.raceLeadPoints }}</div>
              </div>
            </template>
          </div>
        </template>
      </TitledPanel>
      <div class="controls" v-if="coachName == 'Christer' && !hasFutureSeason">
        <button @click="createSeason">Create Next Season</button>
      </div>
    </div>
  </div>

  <modal
    id="qualifying"
    class="dialog"
    v-show="qualifyHelp === true"
    :modal-size="'medium'"
    :exclude-header="false"
    :exclude-buttons="true"
    @cancel="qualifyHelp = false"
  >
    <template #header>Qualifying for the Steel Gauntlet</template>
    <template #body>
      <p>
        The Team Standings page shows a qualifier status for each team. This
        status is related to the Steel Gauntlet major tournament, and indicates
        the current state of which teams will be prioritized for inclusion in
        the tournament.
      </p>
      <p>
        One team per roster will qualify for the tournament, with priority given
        to the highest standing eligible team (as ordered by the team standings
        page). Being eligible to the tournament simply means that the team must
        have played a minimum of 10 games, and can not have played outside of
        the Blackbox Trophy for the given season. A coach may only bring one
        team into the Steel Gauntlet, even if they have multiple qualifying
        teams.
      </p>
      <p>
        The Qualification column on the Team Standings will show a code for each
        eligible team. The first letter will be either "Q", "E", or "W". "Q"
        designates a Qualified team, meaning they are the first choice for the
        roster and have their spot guaranteed. "E" designates an Eligible team,
        meaning they could be given a spot if the higher standing teams of the
        same roster decline their spot. And finally "W" designates a team with a
        Wildcard spot in the tournament. Wildcard spots are given to the top
        teams with coaches who otherwise has not qualified to fill up the
        tournament up to the maximum of 32 participants.
      </p>
      <p>
        The number after the dash indicate the placement within the roster for
        the team. For example, a 1 will mean that the team is the highest
        standing team for the roster, and will be accepted into the tournament
        if they choose to take the spot. A 2 means that there is another team
        with a higher standing, and this team will only get a spot in the
        tournament if the higher standing team declines.
      </p>
      <p>
        These qualifier status indicators will change over time as people
        continue to play their teams, and shows the status as if the Steel
        Gauntlet was starting immediately and all qualifying teams accept their
        spots.
      </p>
    </template>
  </modal>

  <modal
    class="tiers"
    v-show="tierDisplay === true"
    :modal-size="'large'"
    :exclude-header="true"
    :exclude-buttons="true"
    @cancel="tierDisplay = false"
  >
    <template v-slot:header> Tiers </template>

    <template v-slot:body>
      <div v-if="selectedSeason != null" class="seasonHeader">
        Season {{ selectedSeason.season }}
      </div>

      <drop
        _tag="tier"
        :drag-image-opacity="1"
        class="tierwrap"
        mode="move"
        @drop="(event: any) => drop(event, { cost: nextCostUp })"
      >
        <div class="tier">
          New Tier (Cost
          {{ nextCostUp }})
        </div>
      </drop>

      <template v-for="tier in seasonData" :key="tier.tier">
        <drop
          _tag="tier"
          :drag-image-opacity="1"
          class="tierwrap"
          mode="move"
          @drop="(event: any) => drop(event, tier)"
        >
          <div class="tier">Tier {{ tier.tier }} (Cost {{ tier.cost }})</div>

          <template v-for="roster in tier.rosters" :key="roster.id">
            <RosterBox :draggable="true" :roster="roster"></RosterBox>
          </template>
        </drop>
      </template>

      <drop
        v-if="nextCostDown >= 0"
        _tag="tier"
        :drag-image-opacity="1"
        class="tierwrap"
        mode="move"
        @drop="(event: any) => drop(event, { cost: nextCostDown })"
      >
        <div class="tier">
          New Tier (Cost
          {{ nextCostDown }})
        </div>
      </drop>
    </template>
  </modal>

  <ErrorModal ref="errorModal" />
  <RenameSquadModal ref="renameSquadModal" @confirmed="renameSquad" />
</template>

<style scoped>
@import "./boxtrophy.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref } from "vue-facing-decorator";

import {
  PageHeader,
  TitledPanel,
  Modal,
  Trinary,
  ErrorModal,
  SortableTable,
} from "@components/fumbblcomponents";
import FumbblApi from "../team/include/FumbblApi";
import RosterBox from "./rosterbox.vue";
import Progress from "./progress.vue";
import SeasonPicker from "./seasonpicker.vue";
import { Drop } from "vue-easy-dnd";
import RenameSquadModal from "./modals/renamesquad.vue";

@Component({
  components: {
    PageHeader,
    TitledPanel,
    modal: Modal,
    RosterBox,
    Drop,
    Progress,
    SeasonPicker,
    Trinary,
    ErrorModal,
    RenameSquadModal,
    SortableTable,
  },
})
class BoxTrophy extends Vue {
  public apiBase: string = "";
  public coachName: string | null = null;
  public page: string = "";
  private fumbblApi: FumbblApi | null = null;
  public tierDisplay: boolean = false;
  public seasonData: any = null;
  public selectedSeason: any = null;
  public hasFutureSeason: boolean = true;
  public nextCostUp: number = 0;
  public nextCostDown: number = 99;
  public stats: any = null;
  public squads: any[] = [];
  private hasJoined: boolean = false;
  public rosterLeadScores: any[] = [];
  public expanded: string = "";
  public teamFilter = "All";
  public teams: any[] = [];
  public enableQualifier: boolean = false;
  public qualifyHelp: boolean = false;
  public showPlayoffControls: boolean = false;
  public showSquadRenameDialog: boolean = false;
  public oldSquadName: string = "";
  public selectedSquadId: number = 0;
  public designateTeams: any = null;
  public coachStatus: any = null;
  public rosterStatus: any;
  public checkedTeams: any[] = [];
  public teamPriority: number = 0;
  public recentMatches: any[] = [];

  @Ref
  public errorModal: InstanceType<typeof ErrorModal> | undefined;

  @Ref
  public renameSquadModal: InstanceType<typeof RenameSquadModal> | undefined;

  public get started() {
    return this.progress.started;
  }
  public get ended() {
    return this.progress.ended;
  }

  @Ref
  public nav: any;

  @Ref
  public progress: any;

  public navItems: any = [
    { label: "Rules", page: "rules" },
    { label: "Recent Matches", page: "recentMatches" },
    { label: "My Squads", page: "mySquads" },
    { label: "Squad Score", page: "squadStandings" },
    { label: "Team Score", page: "teamStandings" },
    { label: "Statistics", page: "statistics" },
  ];

  public seasons: any = [];

  public changed() {}

  public async mounted() {
    this.fumbblApi = new FumbblApi();

    if (window.location.host.indexOf("dev.") !== 0) {
      this.apiBase = "https://" + window.location.host;
    }

    this.coachName = document
      .getElementsByClassName("boxtrophypage")[0]
      .getAttribute("coach");

    if (this.coachName == "Christer") {
      this.nav.addNav("Admin", "config");
    }

    this.$nextTick(async () => {
      let season = await this.fumbblApi?.getSeasonConfig(0);
      await this.loadSeasons();
      await this.loadSeasonData(season?.data);

      if (window.location.hash && window.location.hash.length > 0) {
        const c = window.location.hash.substring(1);
        this.setPage(c);
      } else {
        this.setPage(this.page);
      }
    });
  }

  public setPage(newPage: string) {
    if (newPage == this.page) {
      //return;
    }

    switch (newPage) {
      case "rules":
        break;
      case "mySquads":
        this.showPlayoffControls = false;
        this.loadStandings();
        break;
      case "playoffSettings":
        this.loadTeamStandings(true);
        break;
      case "squadStandings":
        this.loadStandings();
        break;
      case "teamStandings":
        this.loadTeamStandings();
        break;
      case "statistics":
        this.loadStatistics();
        break;
      case "config":
        break;
      case "designate":
        this.loadTeams();
        break;
      case "recentMatches":
        this.loadRecentMatches();
        break;
      default:
        break;
    }

    this.page = newPage;
  }

  public async loadSeasons() {
    if (this.fumbblApi) {
      var seasons = await this.fumbblApi.getSeasons();
      this.seasons = seasons.data;

      this.hasFutureSeason = !seasons.data[seasons.data.length - 1].isActive;
      return true;
    }
    return false;
  }

  public async createSeason() {
    await this.fumbblApi?.newSeason();
    await this.loadSeasons();
  }

  public async drop(event: any, tier: any) {
    await this.fumbblApi?.setSeasonCost(
      this.selectedSeason.season,
      event.data.id,
      tier.cost,
    );
    this.selectSeason(this.selectedSeason);
  }

  public async selectSeason(season: any) {
    this.loadSeasonData(season);
    this.tierDisplay = true;
  }

  public async loadSeasonData(season: any) {
    var seasonConfig = await this.fumbblApi?.getSeason(season.season);

    var seasonData: any = {};

    var data: any[] = seasonConfig?.data;

    this.nextCostUp = 0;
    this.nextCostDown = 99;

    for (var roster of data) {
      var tier = roster.tier;
      var cost = roster.cost;
      if (cost >= this.nextCostUp) {
        this.nextCostUp = cost + 1;
      }
      if (cost <= this.nextCostDown) {
        this.nextCostDown = cost - 1;
      }
      var rosterName = roster.roster;
      var id = roster.id;
      var logo = roster.logo;

      if (!("Tier" + tier in seasonData)) {
        seasonData["Tier" + tier] = {
          tier: tier,
          cost: cost,
          rosters: [],
        };
      }

      seasonData["Tier" + tier].rosters.push({
        roster: rosterName,
        id: id,
        logo: logo,
      });
    }

    this.seasonData = seasonData;
    this.selectedSeason = season;

    this.enableQualifier = parseInt(season.season) >= 8;

    this.setPage(this.page);
  }

  public async loadStatistics() {
    let stats = await this.fumbblApi?.getSeasonStats(
      this.selectedSeason.season,
    );
    this.stats = stats?.data;
  }

  public async loadStandings() {
    if (this.selectedSeason == null) {
      return;
    }

    await this.loadTrophyStatus();

    let result = await this.fumbblApi?.getSeasonStandings(
      this.selectedSeason.season,
    );

    if (result == null) {
      return;
    }

    let gamesPerSeason =
      this.selectedSeason.numTeams * this.selectedSeason.gamesPerTeam;
    this.squads = result.data;
    this.hasJoined =
      this.squads.findIndex(
        (c) => c.name === this.coachName && c.games < gamesPerSeason,
      ) !== -1;

    var rosterLeads: any[] = [];
    for (const row of result.data) {
      if (!row.squad || row.squad.length == 0) {
        row.squad = "Unnamed Squad";
      }
      for (const team of row.teams) {
        if (
          rosterLeads[team.race] === undefined ||
          team.score > rosterLeads[team.race]
        ) {
          rosterLeads[team.race] = team.score;
        }
      }
    }
    this.rosterLeadScores = rosterLeads;
  }

  public expand(coach: any) {
    this.expanded = this.expanded === coach ? "" : coach;
  }
  public teamLink(team: any) {
    return "/t/" + team.id;
  }
  public coachLink(coach: string) {
    return "/~" + encodeURIComponent(coach);
  }
  public matchLink(id: number) {
    return "https://fumbbl.com/p/match?id=" + id;
  }
  public getPosition(score: any) {
    return this.squads.filter((s) => s.score > score).length + 1;
  }
  public getRecord(teams: any) {
    var wins = 0;
    var ties = 0;
    var losses = 0;

    for (var t in teams) {
      wins += teams[t].wins;
      ties += teams[t].ties;
      losses += teams[t].losses;
    }

    return wins + " / " + ties + " / " + losses;
  }

  public changeTeamStandingFilter(event: any) {
    this.teamFilter = event.target.value;
    this.loadTeamStandings();
  }

  public async loadTrophyStatus() {
    if (this.coachName == null) {
      return;
    }

    let rosterDict: any = {};
    this.coachStatus = (
      await this.fumbblApi?.getTrophyStatus(this.coachName)
    )?.data;

    for (let r in this.coachStatus) {
      let team = this.coachStatus[r];
      rosterDict[team.roster.id] = team;
    }
    this.rosterStatus = rosterDict;
  }

  public async loadTeams() {
    if (this.coachName == null) {
      return;
    }

    await this.loadTrophyStatus();

    let teams = (await this.fumbblApi?.getTeamsForCoach(this.coachName))?.data;

    let teamArray = [];

    for (let t in teams) {
      let team = teams[t];
      if (!this.allowDesignate(team)) {
        continue;
      }

      teamArray.push(team);
      let logo = team.raceLogos[0].logo;
      if (logo == 0) {
        logo = 486370;
      }
      team.logo = logo;
    }

    this.designateTeams = teamArray;
  }

  public async loadRecentMatches() {
    let matches = (await this.fumbblApi?.getRecentTrophyMatches())?.data;

    matches.forEach(
      (m: any) => (m.replayLink = "/ffblive.jnlp?replay=" + m.replayId),
    );

    this.recentMatches = matches;
  }

  private allowDesignate(team: any): boolean {
    return (
      team.divisionId == 2 &&
      team.games == 0 &&
      team.status == "Active" &&
      this.rosterStatus[team.rosterId] != undefined &&
      this.rosterStatus[team.rosterId].used == false
    );
  }

  public async loadTeamStandings(loadAllOwn = false) {
    let teamStandings = await this.fumbblApi?.getSeasonTeamStandings(
      this.selectedSeason.season,
      loadAllOwn,
    );

    this.teams = teamStandings?.data;

    if (loadAllOwn) {
      this.prioritySort();
    }

    this.teamPriority++;
  }

  public getSquadError(): string {
    if (this.checkedTeams.length != this.selectedSeason.numTeams) {
      return (
        "The squad must have exactly " +
        this.selectedSeason.numTeams +
        " team" +
        (this.selectedSeason.numTeams == 1 ? "" : "s")
      );
    }
    if (this.getTotalSquadCost() > this.selectedSeason.totalTeamCost) {
      return (
        "Max squad cost must be equal to or lower than " +
        this.selectedSeason.totalTeamCost
      );
    }

    return "";
  }

  public async designateSquad(): Promise<void> {
    if (this.getSquadError().length != 0) {
      return;
    }

    const teams = this.checkedTeams.map((x) => parseInt(x.id, 10));

    const response = await this.fumbblApi?.selectSquad(
      this.coachName ?? "",
      teams,
    );

    if (!response?.isSuccessful()) {
      this.errorModal?.show({
        general: response?.getErrorMessage(),
        technical: "",
      });
      return;
    }

    this.setPage("mySquads");
  }

  public getTotalSquadCost(): number {
    const cost = this.checkedTeams.reduce(
      (acc, val) => acc + parseFloat(this.rosterStatus[val.rosterId].cost),
      0,
    );
    return cost;
  }

  public allowRoster(rosterId: number): boolean {
    return this.rosterStatus[rosterId] != undefined;
  }

  public getRosterCost(team: any) {
    let rosterId = team.rosterId;

    return Math.trunc(this.rosterStatus[rosterId].cost);
  }

  private prioritySort() {
    this.teams.sort((a, b) => a.priority - b.priority);
  }

  public showQualifyHelp() {
    this.qualifyHelp = true;
  }

  public showTeam(team: any) {
    var result =
      this.teamFilter == "All" ||
      (this.teamFilter == "Qualifying" && (team.qualifying || team.wildcard)) ||
      (this.teamFilter == "Eligible" && team.eligible) ||
      this.teamFilter == team.roster;

    return result;
  }

  public visibleTeams(teams: any) {
    return teams.filter(this.showTeam);
  }

  public getQualifierState(team: any) {
    let choice = "&nbsp;";
    switch (team.playoffChoice) {
      case "Accept":
        choice = '<span style="color: green">&#10003;</span> ';
        break;
      case "Decline":
        choice = '<span style="color: red">&#10007;</span> ';
        break;
      default:
        choice = "&nbsp;";
        break;
    }

    if (!team.eligible) {
      return "";
    }

    if (team.qualifying) {
      return choice + "Q-" + team.rosterStanding;
    }

    if (team.wildcard) {
      return choice + "W-" + team.rosterStanding;
    }

    return choice + "E-" + team.rosterStanding;
  }

  public showSquadRenameControl(squad: any) {
    this.selectedSquadId = squad.squadId;
    this.renameSquadModal?.show(squad.squad);
  }

  public renameSquad(newName: string) {
    this.$nextTick(async () => {
      await this.fumbblApi?.renameSquad(this.selectedSquadId, newName);
      this.setPage("mySquads");
    });
  }

  public getBestPossible(teams: any) {
    var best = 0;
    var squadCost = 0;

    for (var t in teams) {
      let team = teams[t];
      var teamScore = this.getBestForTeam(team);
      best += teamScore;

      if (teamScore >= this.rosterLeadScores[team.race]) {
        best += this.selectedSeason.raceLeadPoints;
      }

      squadCost += parseFloat(this.rosterStatus[team.rosterId].cost); //this.raceCosts[teams[t].race];
    }

    best +=
      (this.selectedSeason.totalTeamCost - squadCost) *
      this.selectedSeason.unusedCostPoints;

    return best;
  }
  public getBestForTeam(team: any) {
    var cfg = this.selectedSeason;
    var score =
      team.score +
      (cfg.gamesPerTeam - team.games) +
      (cfg.gamesPerTeam / cfg.matchesForBonus -
        Math.floor(team.games / cfg.matchesForBonus)) *
        cfg.bonusScore;

    return score;
  }

  public getPlayoffState(team: any) {
    if (team.playoffChoice == "Accept") {
      return "R";
    } else if (team.playoffChoice == "Decline") {
      return "L";
    }
    return "M";
  }

  public async playoffChanged(args: any) {
    let [team, newValue] = args;

    let teamId = parseInt(team);

    let stateMap: any = {
      L: "Decline",
      M: "Undecided",
      R: "Accept",
    };

    for (let i in this.teams) {
      if (this.teams[i].id == teamId) {
        this.teams[i].playoffChoice = stateMap[newValue];
        break;
      }
    }

    await this.fumbblApi?.setPlayoffState(teamId, stateMap[newValue]);
  }

  public async onTeamMoved() {
    this.teamPriority++;
    console.log(this.teams);
    console.log(this.teams.map((x) => x.team));
    let num = 0;
    for (let i in this.teams) {
      num++;
      this.teams[i].priority = num;
    }

    await this.fumbblApi?.setTeamPriorities(this.teams.map((x) => x.id));
  }

  public isParticipant(coach: string) {
    return this.squads.filter((s) => s.name === coach).length > 0;
  }
}

export default toNative(BoxTrophy);
</script>
