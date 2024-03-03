import { Coach, TeamStatusValue } from "./Interfaces";
import Player from "./Player";
import RosterIconManager from "./RosterIconManager";
import TeamManagementSettings from "./TeamManagementSettings";
import TeamStatus from "./TeamStatus";

export default class Team {
  private readonly COMPETITIVE_DIVISION_NAME: string = "Competitive";
  private readonly LEAGUE_DIVISION_NAME: string = "League";
  private readonly QUANTITY_ALLOWED_DENOTING_LINEMEN: number = 12;
  public id: number = 0;
  private teamStatus: TeamStatus = new TeamStatus("NEW");
  private name: string = "";
  private division: string = "";
  public coach: Coach|null = null;
  public players: Player[] = [];
  public extraPlayers: Player[] = [];
  private teamValue: number = 0;
  private tvLimit: number = 0;
  private currentTeamValue: number = 0;
  public treasury: number = 0;
  private rerolls: number = 0;
  private minStartDedicatedFans: number = 0;
  public dedicatedFans: number = 0; // Needs to be public, bound to v-model
  private assistantCoaches: number = 0;
  private cheerleaders: number = 0;
  private apothecary: boolean = false;
  public seasonInfo: {
    gamesPlayedInCurrentSeason: number;
    currentSeason: number;
  } = { gamesPlayedInCurrentSeason: 0, currentSeason: 1 };
  private redrafting: {
    redraftCap: number;
    cappedBudget: number;
    tooltip: string;
  } = { redraftCap: 0, cappedBudget: 0, tooltip: "" };
  private maxPlayers: number;
  public record: any = {};
  private sppLimits: any;
  private bio: string|null = null;
  private logo: number|null = null;

  constructor(
    division: string,
    minStartFans: number,
    treasury: number,
    maxPlayers: number,
  ) {
    this.division = division;
    this.name = "New demo team name";
    this.coach = {
      id: 0,
      name: "________DEMO_COACH________",
    };
    this.minStartDedicatedFans = minStartFans;
    this.dedicatedFans = minStartFans;
    this.treasury = treasury;
    this.maxPlayers = maxPlayers;
  }

  static fromApi(
    rawApiTeam: any,
    minStartDedicatedFans: number,
    teamManagementSettings: TeamManagementSettings,
    playerIconRowVersionPositions: any,
    rosterIconManager: RosterIconManager,
  ): Team {
    const team = new Team(
      rawApiTeam.division,
      minStartDedicatedFans,
      rawApiTeam.treasury,
      teamManagementSettings.maxPlayers,
    );
    team.id = rawApiTeam.id;
    team.teamStatus = TeamStatus.fromApi(rawApiTeam.status);
    team.name = rawApiTeam.name;
    team.coach = {
      id: rawApiTeam.coach.id,
      name: rawApiTeam.coach.name,
    };
    team.teamValue = rawApiTeam.teamValue;
    team.tvLimit = rawApiTeam.tvLimit;
    team.currentTeamValue = rawApiTeam.currentTeamValue;
    team.rerolls = rawApiTeam.rerolls;
    team.dedicatedFans = rawApiTeam.fanFactor;
    team.assistantCoaches = rawApiTeam.assistantCoaches;
    team.cheerleaders = rawApiTeam.cheerleaders;
    team.apothecary = rawApiTeam.apothecary === "Yes";
    team.seasonInfo.gamesPlayedInCurrentSeason =
      rawApiTeam.seasonInfo.gamesPlayedInCurrentSeason;
    team.seasonInfo.currentSeason = rawApiTeam.seasonInfo.currentSeason;
    team.redrafting.redraftCap = rawApiTeam.redrafting.redraftCap;
    team.redrafting.cappedBudget = rawApiTeam.redrafting.cappedBudget;
    team.redrafting.tooltip = rawApiTeam.redrafting.tooltip;
    team.record = rawApiTeam.record;
    team.sppLimits = rawApiTeam.skillLimits.spp;
    team.bio = rawApiTeam.bio.htmlBio;
    team.logo = parseInt(rawApiTeam.bio.image);

    team.initializePlayers();

    for (const rawApiPlayer of rawApiTeam.players) {
      let iconRowVersionPosition =
        rosterIconManager.getNextAvailableIconRowVersionPosition(
          rawApiPlayer.positionId,
          team.getTakenIconRowVersionPositionsOfPositionId(
            rawApiPlayer.positionId,
          ),
        );
      if (playerIconRowVersionPositions[rawApiPlayer.id] !== undefined) {
        iconRowVersionPosition = playerIconRowVersionPositions[rawApiPlayer.id];
      }
      const isJourneyman =
        rawApiPlayer.number > teamManagementSettings.maxPlayers;

      team.addPlayer(
        Player.fromApi(
          rawApiPlayer,
          teamManagementSettings.getPosition(rawApiPlayer.positionId),
          iconRowVersionPosition,
          isJourneyman,
          team.getNumberOfSkillsForLegend(),
          rawApiPlayer.hasBio,
        ),
      );
    }
    return team;
  }

  public getId(): number {
    return this.id;
  }

  public getDivision(): string {
    return this.division;
  }

  public isCompetitiveDivision(): boolean {
    return this.getDivision() === this.COMPETITIVE_DIVISION_NAME;
  }

  public isLeagueDivision(): boolean {
    return this.getDivision() === this.LEAGUE_DIVISION_NAME;
  }

  public getDivisionAbbreviated(): string {
    return this.division.charAt(0);
  }

  public getTeamStatus(): TeamStatus {
    return this.teamStatus;
  }

  public setTeamStatus(teamStatusValue: TeamStatusValue) {
    this.teamStatus = new TeamStatus(teamStatusValue);
  }

  public getName(): string {
    return this.name;
  }

  public setName(teamName: string): void {
    this.name = teamName;
  }

  public getCoach(): Coach|null {
    return this.coach;
  }

  public getTeamValue(): number {
    return this.teamValue;
  }

  public getTvLimitDisplay(): number {
    if (this.teamStatus.isRetired() || !this.isCompetitiveDivision()) {
      return 0;
    }
    return Math.ceil(this.tvLimit / 5000) * 5;
  }

  public getCurrentTeamValue(): number {
    return this.currentTeamValue;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getRosteredPlayers(): Player[] {
    return this.players.filter(
      (player) => !player.IsEmpty && !player.getIsJourneyman(),
    );
  }

  public initializePlayers() {
    for (let i = 0; i < this.maxPlayers; i++) {
      this.players.push(Player.emptyPlayer(i + 1));
    }
  }

  public addPlayer(player: Player): void {
    if (player.IsExtraPlayer) {
      this.extraPlayers.push(player);
    } else {
      this.players[player.number - 1] = player;
    }
    this.sortPlayers();
  }

  public sortPlayers(): void {
    this.players.sort((a, b) => a.playerNumber - b.playerNumber);
    this.extraPlayers.sort((a, b) => a.playerNumber - b.playerNumber);
  }

  public buyPlayer(player: Player): void {
    this.addPlayer(player);
    this.treasury -= player.getPlayerCost();
  }

  public hireJourneyman(player: Player): void {
    if (!player.getIsJourneyman()) {
      return;
    }

    const lastEmptyNumber = this.findLastEmptyNumber();
    if (!lastEmptyNumber) {
      return;
    }

    const extraPlayerIndex = this.extraPlayers.findIndex(
      (extraPlayer) => extraPlayer.getId() === player.getId(),
    );
    this.extraPlayers[extraPlayerIndex] = Player.emptyPlayer(
      player.playerNumber,
    );
    player.permanentlyHireJourneyman(lastEmptyNumber);

    this.buyPlayer(player);
  }

  public findPlayerByNumber(playerNumber: number): Player | null {
    return this.players[playerNumber - 1];
  }

  public removePlayer(player: Player): void {
    if (this.teamStatus.isNew() || player.getIsRefundable()) {
      this.treasury += player.getPositionCost();
    }
    const index = this.players.findIndex(
      (playerToMatch) => playerToMatch.id === player.id,
    );
    if (index !== -1) {
      this.players[index] = Player.emptyPlayer(player.playerNumber);
    }
  }

  public removeTemporaryPlayers(): void {
    const temporaryPlayers = this.players.filter(
      (player) => player.isTemporaryPlayer,
    );
    if (this.teamStatus.isNew()) {
      const temporaryPlayersCost = temporaryPlayers.reduce(
        (cost: number, player: Player) => cost + player.getPositionCost(),
        0,
      );
      if (temporaryPlayersCost > 0) {
        this.treasury += temporaryPlayersCost;
      }
    }
    temporaryPlayers.forEach((tempPlayer) => {
      const index = this.players.findIndex(
        (player) => player.getId() === tempPlayer.getId(),
      );
      if (index !== -1) {
        this.players.splice(index, 1);
      }
    });
  }

  public removeAllPlayers(): void {
    if (this.teamStatus.isNew()) {
      const playerCost = this.players
        .filter((p) => !p.IsEmpty)
        .reduce(
          (cost: number, player: Player) => cost + player.getPositionCost(),
          0,
        );
      if (playerCost > 0) {
        this.treasury += playerCost;
      }
      const emptyPlayers = [];
      for (let i = 0; i < this.maxPlayers; i++) {
        emptyPlayers.push(Player.emptyPlayer(i + 1));
      }
      this.players = emptyPlayers;
    }
  }

  public getRerolls(): number {
    return this.rerolls;
  }

  public getDedicatedFans(): number {
    return this.dedicatedFans;
  }

  public getAssistantCoaches(): number {
    return this.assistantCoaches;
  }

  public getCheerleaders(): number {
    return this.cheerleaders;
  }

  public getApothecary(): boolean {
    return this.apothecary;
  }

  public getGamesPlayedInSeason(): number {
    return this.seasonInfo.gamesPlayedInCurrentSeason;
  }

  public getCurrentSeason(): number {
    return this.seasonInfo.currentSeason;
  }

  public getRedraftCappedBudget(): number {
    return this.redrafting.cappedBudget;
  }

  public getRedraftTooltip(): string {
    return this.redrafting.tooltip;
  }

  public countPlayersOfPositionId(positionId: number): number {
    return this.players.filter(
      (player) => player.getPositionId() === positionId,
    ).length;
  }

  public getTakenIconRowVersionPositionsOfPositionId(
    positionId: number,
  ): number[] {
    return this.players
      .filter((player) => player.getPositionId() === positionId)
      .map((player: Player) => {
        return player.getIconRowVersionPosition();
      });
  }

  public getMissNextGamePlayers(): Player[] {
    return this.getRosteredPlayers().filter((player) => {
      return player.isMissNextGame();
    });
  }

  public getLinemenPlayers(): Player[] {
    return this.getRosteredPlayers().filter((player) => {
      const position = player.getPosition();
      return (
        position != null && position.quantityAllowed >=
        this.QUANTITY_ALLOWED_DENOTING_LINEMEN
      );
    });
  }

  public countMissNextGamePlayers(): number {
    return this.getMissNextGamePlayers().length;
  }

  public countPlayersAvailableNextGame(): number {
    return this.getRosteredPlayers().length - this.countMissNextGamePlayers();
  }

  public getNumberOfSkillsForLegend(): number {
    return this.sppLimits.length;
  }

  public updateDedicatedFans(
    dedicatedFans: number,
    dedicatedFansCost: number,
  ): void {
    if (this.teamStatus.isNew()) {
      const dedicatedFansDifference = dedicatedFans - this.getDedicatedFans();
      this.treasury -= dedicatedFansDifference * dedicatedFansCost;
      this.dedicatedFans = dedicatedFans;
    }
  }

  public addReroll(cost: number): void {
    this.rerolls++;
    this.treasury -= cost;
  }

  public removeReroll(cost: number): void {
    this.rerolls--;
    if (this.teamStatus.isNew()) {
      this.treasury += cost;
    }
  }

  public addAssistantCoach(cost: number): void {
    this.assistantCoaches++;
    this.treasury -= cost;
  }

  public removeAssistantCoach(cost: number): void {
    this.assistantCoaches--;
    if (this.teamStatus.isNew()) {
      this.treasury += cost;
    }
  }

  public addCheerleader(cost: number): void {
    this.cheerleaders++;
    this.treasury -= cost;
  }

  public removeCheerleader(cost: number): void {
    this.cheerleaders--;
    if (this.teamStatus.isNew()) {
      this.treasury += cost;
    }
  }

  public addApothecary(cost: number): void {
    this.apothecary = true;
    this.treasury -= cost;
  }

  public removeApothecary(cost: number): void {
    this.apothecary = false;
    if (this.teamStatus.isNew()) {
      this.treasury += cost;
    }
  }

  public canAfford(treasuryCost: number): boolean {
    return this.treasury >= treasuryCost;
  }

  public findFirstEmptyNumber(): number | null {
    let firstEmptyIndex;

    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].IsEmpty) {
        firstEmptyIndex = i;
        break;
      }
    }

    return firstEmptyIndex !== undefined ? firstEmptyIndex + 1 : null;
  }

  public findLastEmptyNumber(): number | null {
    let lastEmptyIndex;

    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].IsEmpty) {
        lastEmptyIndex = i;
      }
    }

    return lastEmptyIndex !== undefined ? lastEmptyIndex + 1 : null;
  }

  public hasEmptyNumbers(): boolean {
    return this.findFirstEmptyNumber() !== null;
  }
}
