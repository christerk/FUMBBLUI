import {
  AddRemovePermissions,
  Position,
  PositionDataForBuyingPlayer,
  PositionStats,
  SetupTeamManagementSettings,
} from "./Interfaces";
import Player from "./Player";
import Team from "./Team";

export default class TeamManagementSettings {
  private readonly ALLOW_DISCARD_REROLL: boolean = true;
  private readonly JOURNEYMAN_QUANTITY_INDICATORS: number[] = [12, 16];
  private settings: SetupTeamManagementSettings;

  constructor(
    rawApiRuleset: any,
    rawApiRoster: any,
    hasLowCostLinemen: boolean,
  ) {
    const dedicatedFansCost = 10000;
    const assistantCoachesCost = 10000;
    const cheerleadersCost = 10000;
    const apothecaryCost = 50000;

    const maxRerolls = 8;
    const maxAssistantCoaches = 6;
    const maxCheerleaders = 12;

    const setupTeamManagementSettings: SetupTeamManagementSettings = {
      roster: {
        name: rawApiRoster.name,
        logoId: {
          large: rawApiRoster.logos[192],
        },
      },
      treasury: {
        start: rawApiRuleset.options.teamSettings.startTreasury,
      },
      players: {
        start: rawApiRuleset.options.teamSettings.startPlayers,
        max: rawApiRuleset.options.teamSettings.maxPlayers,
        maxBigGuys: ~~rawApiRoster.maxBigGuys,
        lowCostLinemen: hasLowCostLinemen,
        nameGenerator: rawApiRoster.nameGenerator,
        positions: rawApiRoster.positions.map((position: any) => {
          return {
            id: ~~position.id,
            name: position.title,
            cost: ~~position.cost,
            skills: this.cleanupSkills(position.skills),
            stats: {
              Movement: ~~position.stats.MA,
              Strength: ~~position.stats.ST,
              Agility: ~~position.stats.AG,
              Passing: position.stats.PA !== "0" ? ~~position.stats.PA : null,
              Armour: ~~position.stats.AV,
            } as PositionStats,
            quantityAllowed: ~~position.quantity,
            isBigGuy: position.type === "BIGGUY",
            defaultGender: position.gender,
            isPeaked: position.type === "PEAKED",
            primarySkills: position.normalSkills,
            secondarySkills: position.doubleSkills,
          } as Position;
        }),
      },
      dedicatedFans: {
        start: rawApiRuleset.options.teamSettings.startFans,
        minStart: rawApiRuleset.options.teamSettings.minStartFans,
        maxStart: rawApiRuleset.options.teamSettings.maxStartFans,
        cost: dedicatedFansCost,
      },
      rerolls: {
        max: maxRerolls,
        cost: ~~rawApiRoster.rerollCost,
      },
      sidelineStaff: {
        assistantCoaches: {
          max: maxAssistantCoaches,
          cost: assistantCoachesCost,
        },
        cheerleaders: {
          max: maxCheerleaders,
          cost: cheerleadersCost,
        },
        apothecary: {
          allowed: rawApiRoster.apothecary === "Yes",
          cost: apothecaryCost,
        },
      },
      seasons: {
        enabled:
          rawApiRuleset.options.rulesetOptions.seasons === true ||
          rawApiRuleset.options.rulesetOptions.seasons === "true",
        seasonLength: rawApiRuleset.options.rulesetOptions.seasonLength,
        agentFee: {
          base: rawApiRuleset.options.rulesetOptions.seasonAgentFeeBase,
          perSeason:
            rawApiRuleset.options.rulesetOptions.seasonAgentFeePerSeason,
          seasonModifier:
            rawApiRuleset.options.rulesetOptions.seasonAgentFeeSeasonModifier,
        },
      },
      ruleset: {
        expensiveMistakes: {
          enabled:
            rawApiRuleset.options.rulesetOptions.expensiveMistakes === true ||
            rawApiRuleset.options.rulesetOptions.expensiveMistakes === "true",
          start: rawApiRuleset.options.rulesetOptions.expensiveMistakesStart,
        },
        isProgression:
          rawApiRuleset.options.teamSettings.teamProgression === "standard",
        minPlayers: rawApiRuleset.options.clientOptions.playersOnField,
      },
    };

    // https://fumbbl.com/api/ruleset/get/4
    // data.options.teamSettings.teamProgression
    // data.options.teamSettings.skillProgressionType
    // data.options.teamSettings.sppLimits": "6,16,31,51,76,176"
    // data.options.teamSettings.predeterminedSkills": "0:6N2D8S|0:3N|0:2N2D|0:3N3D|0:6N2D"
    // data.options.teamSettings.skillsPerPlayer

    this.settings = setupTeamManagementSettings;
  }

  private cleanupSkills(skills: string[]) {
    const cleanSkills: string[] = [];
    for (const skill of skills) {
      if (skill.includes(" (")) {
        const cleanSkill = skill.substring(0, skill.indexOf(" ("));
        cleanSkills.push(cleanSkill);
      } else {
        cleanSkills.push(skill);
      }
    }
    return cleanSkills;
  }

  public get rosterName() {
    return this.settings.roster.name;
  }

  public get logoIdLarge() {
    return this.settings.roster.logoId.large;
  }

  public get maxPlayers() {
    return this.settings.players.max;
  }

  public get maxBigGuys() {
    return this.settings.players.maxBigGuys;
  }

  public get nameGenerator() {
    return this.settings.players.nameGenerator;
  }

  public get seasonsEnabled(): boolean {
    return this.settings.seasons.enabled;
  }

  public get seasonLength(): number {
    return this.settings.seasons.seasonLength;
  }

  public get expensiveMistakesEnabled(): boolean {
    return this.settings.ruleset.expensiveMistakes.enabled;
  }

  public get expensiveMistakesStart(): number {
    return this.settings.ruleset.expensiveMistakes.start * 1000;
  }

  public get isProgression(): boolean {
    return this.settings.ruleset.isProgression;
  }

  public get startPlayers() {
    return this.settings.players.start;
  }

  public get startTreasury() {
    return this.settings.treasury.start;
  }

  public get minStartFans() {
    return this.settings.dedicatedFans.minStart;
  }

  public get rerollCostOnCreate(): number {
    return this.settings.rerolls.cost;
  }

  public get rerollCostFull(): number {
    return this.settings.rerolls.cost * 2;
  }

  public get dedicatedFansCost(): number {
    return this.settings.dedicatedFans.cost;
  }

  public getDedicatedFansAllowedValues(
    currentDedicatedFans: number,
    availableTreasury: number,
  ): number[] {
    const startValues: number[] = [];
    for (
      let i = this.settings.dedicatedFans.minStart;
      i <= this.settings.dedicatedFans.maxStart;
      i++
    ) {
      const costOfDedicatedFans =
        (i - currentDedicatedFans) * this.dedicatedFansCost;
      if (costOfDedicatedFans <= availableTreasury) {
        startValues.push(i);
      }
    }
    return startValues;
  }

  public get assistantCoachCost(): number {
    return this.settings.sidelineStaff.assistantCoaches.cost;
  }

  public get cheerleaderCost(): number {
    return this.settings.sidelineStaff.cheerleaders.cost;
  }

  public get apothecaryCost(): number {
    return this.settings.sidelineStaff.apothecary.cost;
  }

  public get apothecaryAllowed(): boolean {
    return this.settings.sidelineStaff.apothecary.allowed;
  }

  public get positions(): Position[] {
    return this.settings.players.positions;
  }

  public get journeymanPositions(): Position[] {
    return this.settings.players.positions.filter((position) =>
      this.JOURNEYMAN_QUANTITY_INDICATORS.includes(position.quantityAllowed),
    );
  }

  public getAgentFee(seasons: number): number {
    return (
      this.settings.seasons.agentFee.base +
      this.settings.seasons.agentFee.perSeason *
        1000 *
        Math.max(0, seasons - this.settings.seasons.agentFee.seasonModifier)
    );
  }

  public getPosition(positionId: number): Position {
    for (const position of this.settings.players.positions) {
      if (position.id === positionId) {
        return position;
      }
    }
    throw Error(`Position not found ${positionId}`);
  }

  public calculateTeamValue(team: Team): number {
    return this.calculateTeamValueForPlayers(team, team.getRosteredPlayers());
  }

  private calculateTeamValueForPlayers(team: Team, players: Player[]): number {
    const playerCost = players.reduce(
      (playerCost, player) => (playerCost += player.getPlayerCost()),
      0,
    );

    return (
      playerCost +
      team.getRerolls() * this.settings.rerolls.cost +
      team.getAssistantCoaches() *
        this.settings.sidelineStaff.assistantCoaches.cost +
      team.getCheerleaders() * this.settings.sidelineStaff.cheerleaders.cost +
      (team.getApothecary() && this.settings.sidelineStaff.apothecary
        ? this.settings.sidelineStaff.apothecary.cost
        : 0)
    );
  }

  public calculateCurrentTeamValueAfterReady(team: Team): [number] {
    const preReadyCtv = this.calculateTeamValueForPlayers(
      team,
      team
        .getRosteredPlayers()
        .filter(
          (player) =>
            player.getPosition() != null &&
            !(
              player.isMissNextGame() ||
              (this.settings.players.lowCostLinemen &&
                this.journeymanPositions.includes(player.getPosition()!))
            ),
        ),
    );

    if (this.settings.players.lowCostLinemen || !this.journeymanPositions) {
      return [preReadyCtv];
    }
    const journeymenToAdd =
      this.settings.ruleset.minPlayers -
      (team.getRosteredPlayers().length - team.getMissNextGamePlayers().length);

    let journeyCosts = 0;
    if (this.journeymanPositions && this.journeymanPositions.length > 0) {
      journeyCosts = this.journeymanPositions[0].cost * journeymenToAdd;
    }

    return [preReadyCtv + journeyCosts];
  }

  public calculateCurrentTeamValue(team: Team): number {
    return this.calculateTeamValueForPlayers(
      team,
      team
        .getRosteredPlayers().concat(team.extraPlayers)
        .filter(
          (player) => player.getPosition() != null && !player.isMissNextGame(),
        ),
    );
  }

  public calculateCreateTeamCost(team: Team): number {
    const dedicatedFansCreateCost =
      (team.getDedicatedFans() - this.settings.dedicatedFans.minStart) *
      this.settings.dedicatedFans.cost;
    return this.calculateTeamValue(team) + dedicatedFansCreateCost;
  }

  public getAddRemovePermissions(team: Team): AddRemovePermissions {
    const rerollCost =
      team.getTeamStatus().isNew() || team.getTeamStatus().isRedrafting()
        ? this.rerollCostOnCreate
        : this.rerollCostFull;
    return {
      rerolls: {
        add:
          team.getRerolls() < this.settings.rerolls.max &&
          team.canAfford(rerollCost),
        remove:
          team.getRerolls() > 0 &&
          (this.ALLOW_DISCARD_REROLL ||
            team.getTeamStatus().isNew() ||
            team.getTeamStatus().isRedrafting()),
      },
      assistantCoaches: {
        add:
          team.getAssistantCoaches() <
            this.settings.sidelineStaff.assistantCoaches.max &&
          team.canAfford(this.assistantCoachCost),
        remove: team.getAssistantCoaches() > 0,
      },
      cheerleaders: {
        add:
          team.getCheerleaders() <
            this.settings.sidelineStaff.cheerleaders.max &&
          team.canAfford(this.cheerleaderCost),
        remove: team.getCheerleaders() > 0,
      },
      apothecary: {
        add:
          this.settings.sidelineStaff.apothecary.allowed &&
          team.getApothecary() === false &&
          team.canAfford(this.apothecaryCost),
        remove:
          this.settings.sidelineStaff.apothecary.allowed &&
          team.getApothecary() === true,
      },
      dedicatedFans: {
        add:
          team.getDedicatedFans() < this.settings.rerolls.max &&
          team.canAfford(this.dedicatedFansCost),
        remove:
          team.getDedicatedFans() > this.settings.dedicatedFans.minStart &&
          team.getTeamStatus().isNew(),
      },
    };
  }

  public getRosterPositionDataForBuyingPlayer(
    availableTreasury: number,
    positionQuantities: { positionId: number; quantity: number }[],
  ): PositionDataForBuyingPlayer[] {
    const rosterPositionDataForBuyingPlayer: PositionDataForBuyingPlayer[] = [];
    for (const position of this.positions.filter(
      (position) => position.quantityAllowed > 0,
    )) {
      let quantityHired = 0;
      for (const positionQuantityData of positionQuantities) {
        if (positionQuantityData.positionId === position.id) {
          quantityHired = positionQuantityData.quantity;
          break;
        }
      }

      rosterPositionDataForBuyingPlayer.push({
        positionId: position.id,
        quantityHired: quantityHired,
        canAfford: position.cost <= availableTreasury,
        position: position,
      } as PositionDataForBuyingPlayer);
    }

    rosterPositionDataForBuyingPlayer.sort((a, b) => {
      const postitionACost = a.position.cost;
      const postitionBCost = b.position.cost;
      if (postitionACost === postitionBCost) {
        return 0;
      }
      return postitionACost > postitionBCost ? -1 : 1;
    });

    return rosterPositionDataForBuyingPlayer;
  }

  public getErrorsForCreate(team: Team): string[] {
    const errors: string[] = [];
    if (team.getName().trim() === "") {
      errors.push("teamNameBlank");
    }

    if (team.getRosteredPlayers().length < this.startPlayers) {
      errors.push("insufficientPlayers");
    }

    const teamCost = this.calculateCreateTeamCost(team);
    if (teamCost > this.startTreasury) {
      errors.push("insufficientTreasury");
    }

    return errors;
  }

  public isValidForCreate(team: Team): boolean {
    return this.getErrorsForCreate(team).length === 0;
  }

  public applyLimits(limits: {
    budget: number;
    rerolls: number;
    fans: number;
    coaches: number;
    cheerleaders: number;
    apothecary: number;
  }) {
    this.settings.rerolls.max = limits.rerolls;
    this.settings.sidelineStaff.apothecary.allowed = limits.apothecary > 0;
    this.settings.sidelineStaff.assistantCoaches.max = limits.coaches;
    this.settings.sidelineStaff.cheerleaders.max = limits.cheerleaders;
  }
}
