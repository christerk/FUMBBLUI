import {Coach, PlayerGender, Position} from "./Interfaces";
import Player from "./Player";
import RosterIconManager from "./RosterIconManager";
import TeamManagementSettings from "./TeamManagementSettings";
import TeamStatus from "./TeamStatus";

export default class Team {
    private readonly COMPETITIVE_DIVISION_NAME: string = 'Competitive';
    private readonly LEAGUE_DIVISION_NAME: string = 'League';
    private readonly QUANTITY_ALLOWED_DENOTING_LINEMEN: number = 12;
    private id: number = 0;
    private teamStatus: TeamStatus = new TeamStatus();
    private name: string = '';
    private division: string = '';
    private coach: Coach = null;
    public players: Player[] = [];
    private teamValue: number = 0;
    private tvLimit: number = 0;
    private currentTeamValue: number = 0;
    private treasury: number = 0;
    private rerolls: number = 0;
    private minStartDedicatedFans: number = 0;
    public dedicatedFans: number = 0; // Needs to be public, bound to v-model
    private assistantCoaches: number = 0;
    private cheerleaders: number = 0;
    private apothecary: boolean = false;
    private seasonInfo: {gamesPlayedInCurrentSeason: number, currentSeason: number} = {gamesPlayedInCurrentSeason: 0, currentSeason: 1};

    constructor(division: string, minStartFans: number, treasury: number) {
        this.division = division;
        this.name = 'New demo team name';
        this.coach = {
            id: 0,
            name: '________DEMO_COACH________',
        };
        this.minStartDedicatedFans = minStartFans;
        this.dedicatedFans = minStartFans;
        this.treasury = treasury;
    }

    static fromApi(
        rawApiTeam: any,
        minStartDedicatedFans: number,
        teamManagementSettings: TeamManagementSettings,
        playerIconRowVersionPositions: any,
        rosterIconManager: RosterIconManager,
    ): Team {
        const team = new Team(rawApiTeam.division, minStartDedicatedFans, rawApiTeam.treasury);
        team.id = rawApiTeam.id;
        team.teamStatus = new TeamStatus(rawApiTeam.status);
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
        team.apothecary = rawApiTeam.apothecary === 'Yes';
        team.seasonInfo.gamesPlayedInCurrentSeason = rawApiTeam.seasonInfo.gamesPlayedInCurrentSeason;
        team.seasonInfo.currentSeason = rawApiTeam.seasonInfo.currentSeason;

        for (const rawApiPlayer of rawApiTeam.players) {
            let iconRowVersionPosition = rosterIconManager.getNextAvailableIconRowVersionPosition(
                rawApiPlayer.positionId,
                team.getTakenIconRowVersionPositionsOfPositionId(rawApiPlayer.positionId),
            );
            if (playerIconRowVersionPositions[rawApiPlayer.id] !== undefined) {
                iconRowVersionPosition = playerIconRowVersionPositions[rawApiPlayer.id];
            }
            team.addPlayer(
                Player.fromApi(
                    rawApiPlayer,
                    teamManagementSettings.getPosition(rawApiPlayer.positionId),
                    iconRowVersionPosition,
                )
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

    public getName(): string {
        return this.name;
    }

    public setName(teamName: string): void {
        this.name = teamName;
    }

    public getCoach(): Coach {
        return this.coach;
    }

    public getTeamValue(): number {
        return this.teamValue;
    }

    public getTvLimitDisplay(): number {
        if (this.teamStatus.isRetired() || ! this.isCompetitiveDivision()) {
            return 0;
        }
        return Math.ceil(this.tvLimit / 5000) * 5;
    }

    public getCurrentTeamValue(): number {
        return this.currentTeamValue;
    }

    public getTreasury(): number {
        return this.treasury;
    }

    public getPlayers(): Player[] {
        return this.players;
    }

    public getRosteredPlayers(): Player[] {
        return this.players.filter(player => ! player.getIsJourneyman());
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
    }

    public buyPlayer(player: Player): void {
        this.addPlayer(player);
        this.treasury -= player.getPositionCost();
    }

    public buyTemporaryPlayer(teamSheetEntryNumber: number, position: Position, iconRowVersionPosition: number, playerGender: PlayerGender): Player {
        const temporaryPlayer = Player.temporaryPlayer(
            teamSheetEntryNumber,
            position,
            iconRowVersionPosition,
            playerGender,
        );
        this.buyPlayer(temporaryPlayer);
        return temporaryPlayer;
    }

    public findPlayerByNumber(playerNumber: number): Player | null {
        const player = this.players.find(player => player.getPlayerNumber() === playerNumber);
        return player ? player : null;
    }

    public removePlayer(player: Player): void {
        if (this.teamStatus.isNew()) {
            this.treasury += player.getPositionCost();
        }
        const index = this.players.findIndex(playerToMatch => playerToMatch.getId() === player.getId());
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    public removeTemporaryPlayers(): void {
        const temporaryPlayers = this.players.filter((player) => player.isTemporaryPlayer());
        if (this.teamStatus.isNew()) {
            const temporaryPlayersCost = temporaryPlayers.reduce((cost: number, player: Player) => cost + player.getPositionCost(), 0);
            if (temporaryPlayersCost > 0) {
                this.treasury += temporaryPlayersCost;
            }
        }
        temporaryPlayers.forEach((tempPlayer) => {
            const index = this.players.findIndex((player) => player.getId() === tempPlayer.getId());
            if (index !== -1) {
                this.players.splice(index, 1);
            }
        });
    }

    public removeAllPlayers(): void {
        if (this.teamStatus.isNew()) {
            const playerCost = this.players.reduce((cost: number, player: Player) => cost + player.getPositionCost(), 0);
            if (playerCost > 0) {
                this.treasury += playerCost;
            }
            this.players = [];
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

    public countPlayersOfPositionId(positionId: number): number {
        return this.players.filter(player => player.getPositionId() === positionId).length;
    }

    public getTakenIconRowVersionPositionsOfPositionId(positionId: number): number[] {
        return this.players.filter(player => player.getPositionId() === positionId).map(
            (player: Player) => {
                return player.getIconRowVersionPosition();
            }
        );
    }

    public getMissNextGamePlayers(): Player[] {
        return this.getRosteredPlayers().filter((player) => {
            return player.isMissNextGame();
        });
    }

    public getLinemenPlayers(): Player[] {
        return this.getRosteredPlayers().filter((player) => {
            return player.getPosition().quantityAllowed >= this.QUANTITY_ALLOWED_DENOTING_LINEMEN;
        });
    }

    public countMissNextGamePlayers(): number {
        return this.getMissNextGamePlayers().length;
    }

    public countPlayersAvailableNextGame(): number {
        return this.getRosteredPlayers().length - this.countMissNextGamePlayers();
    }

    public updateDedicatedFans(dedicatedFans: number, dedicatedFansCost: number): void {
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

    public movePlayer(sourcePlayerNumber: number, targetPlayerNumber: number, emptyTarget: boolean): any {
        const newPlayerNumbers = {};

        if (sourcePlayerNumber === targetPlayerNumber) {
            return;
        }

        const movingUp = sourcePlayerNumber > targetPlayerNumber;

        let sourcePlayer = null;
        for (const player of this.getPlayers()) {
            let playerNumberChanged = false;

            if (player.getPlayerNumber() === sourcePlayerNumber) {
                sourcePlayer = player;
            }

            if (! emptyTarget) {
                if (movingUp) {
                    if (player.getPlayerNumber() >= targetPlayerNumber && player.getPlayerNumber() < sourcePlayerNumber) {
                        player.increasePlayerNumber();
                        playerNumberChanged = true;
                    }
                } else {
                    if (player.getPlayerNumber() <= targetPlayerNumber && player.getPlayerNumber() > sourcePlayerNumber) {
                        player.decreasePlayerNumber();
                        playerNumberChanged = true;
                    }
                }
            }

            if (playerNumberChanged) {
                newPlayerNumbers[player.getId()] = player.getPlayerNumber();
            }
        }

        sourcePlayer.setPlayerNumber(targetPlayerNumber);
        newPlayerNumbers[sourcePlayer.getId()] = sourcePlayer.getPlayerNumber();

        return newPlayerNumbers;
    }

    public canAfford(treasuryCost: number): boolean {
        return this.getTreasury() >= treasuryCost;
    }
}