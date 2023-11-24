import {PlayerGender, PlayerRecord, PlayerSkillStatus, Position} from "./Interfaces";
import UpdatePlayerDetails from "./UpdatePlayerDetails";

export default class Player {
    private static readonly temporaryPlayerId = 0;
    private static readonly temporaryPlayerName = 'Temporary Player';
    static missNextGameInjury = 'm';

    private id: number;
    private playerNumber: number;
    private playerName: string;
    private gender: PlayerGender = 'NEUTRAL';
    private iconRowVersionPosition: number; // allows selection of icon for display when position has multiple versions in the icon image
    private position: Position;
    private injuries: string[] = [];
    private skills: string[] = [];
    private record: PlayerRecord = null;
    private skillStatus: {status: PlayerSkillStatus, maxLimit: number, tier: number} = null;
    private skillCost: number = 0;
    private isJourneyman: boolean = false;
    private isRefundable: boolean = true;
    public foldOut: PlayerRowFoldOutMode = 'CLOSED';
    
    constructor(
        id: number,
        playerNumber: number,
        playerName: string,
        position: Position,
        iconRowVersionPosition: number,
        gender: PlayerGender,
    ) {
        this.id = id;
        this.playerNumber = playerNumber;
        this.playerName = playerName;
        this.position = position;
        this.iconRowVersionPosition = iconRowVersionPosition;
        this.gender = gender;

        this.injuries = [];
        this.skills = [];

        this.record = {
            games: 0,
            completions: 0,
            touchdowns: 0,
            interceptions: 0,
            casualties: 0,
            mvps: 0,
            spp: {total: 0, extra: 0, spent: 0},
        };

        this.skillStatus = {
            status: 'NONE',
            maxLimit: 0,
            tier: 0,
        };
    }

    static fromApi(rawApiPlayer: any, position: Position, iconRowVersionPosition: number): Player {
        const player = new Player(
            rawApiPlayer.id,
            rawApiPlayer.number,
            rawApiPlayer.name,
            position,
            iconRowVersionPosition,
            rawApiPlayer.gender ? rawApiPlayer.gender.toUpperCase() : 'NONBINARY', // older journeymen have null gender
        );
        player.injuries = rawApiPlayer.injuries.split(',').filter(injury => injury !== '');
        player.skills = rawApiPlayer.skills;

        player.skillCost = rawApiPlayer.skillCosts.reduce((totalCost, skillCost) => totalCost += skillCost, 0);

        player.record.games = rawApiPlayer.record.games;
        player.record.completions = rawApiPlayer.record.completions;
        player.record.touchdowns = rawApiPlayer.record.touchdowns;
        player.record.interceptions = rawApiPlayer.record.interceptions;
        player.record.casualties = rawApiPlayer.record.casualties;
        player.record.mvps = rawApiPlayer.record.mvps;
        player.record.spp = {
            total: rawApiPlayer.record.spp,
            extra: rawApiPlayer.record.extra_spp,
            spent: rawApiPlayer.record.spent_spp,
        };

        const skillStatusLookup = {'none': 'NONE', 'canSkill': 'CAN_SKILL', 'mustSkill': 'MUST_SKILL'};
        player.skillStatus = {
            status: skillStatusLookup[rawApiPlayer.skillStatus.status],
            maxLimit: rawApiPlayer.skillStatus.maxLimit,
            tier: rawApiPlayer.skillStatus.tier,
        };

        player.isRefundable = rawApiPlayer.refundable;

        return player;
    }

    static temporaryPlayer(teamSheetEntryNumber: number, position: Position, iconRowVersionPosition: number, playerGender: PlayerGender): Player {
        return new Player(Player.temporaryPlayerId, teamSheetEntryNumber, Player.temporaryPlayerName, position, iconRowVersionPosition, playerGender);
    }

    public getId(): number {
        return this.id;
    }

    public setIdForTemporaryPlayer(playerId: number) {
        if (this.isTemporaryPlayer()) {
            this.id = playerId;
        }
    }

    public get number(): number {
      return this.playerNumber;
    }

    public set number(value) {
      this.playerNumber = value;
    }

    public getPlayerNumber(): number {
        return this.playerNumber;
    }

    public setPlayerNumber(playerNumber: number): void {
        this.playerNumber = playerNumber;
    }

    public getPlayerName(): string {
        return this.playerName;
    }

    public setPlayerName(playerName: string) {
        this.playerName = playerName;
    }

    public getPosition(): Position {
        return this.position;
    }

    public getGender(): PlayerGender {
        return this.gender;
    }

    public getPositionId(): number {
        return this.position.id;
    }

    public getPositionName(): string {
        return this.position.name;
    }

    public getDisplayPositionName(): string {
        const journeymanPrefix = this.getIsJourneyman() ? 'Journeyman ' : '';
        return journeymanPrefix + this.getPositionName();
    }

    public getPositionCost(): number {
        return this.position.cost;
    }

    public getPositionStats(): any {
        return this.position.stats;
    }

    public getPositionSkills(): string[] {
        return this.position.skills;
    }

    public getSkillCost(): number {
        return this.skillCost;
    }

    public getPlayerCost(): number {
        return this.getPositionCost() + this.getSkillCost();
    }

    public getIconRowVersionPosition(): number {
        return this.iconRowVersionPosition;
    }

    public getInjuries(): string[] {
        return this.injuries;
    }

    public getSkills(): string[] {
        return this.skills;
    }

    public getIsJourneyman(): boolean {
        return this.isJourneyman;
    }

    public setIsJourneyman(isJourneyman: boolean) {
        this.isJourneyman = isJourneyman;
    }

    public permanentlyHireJourneyman(newTeamSheetEntryNumber: number) {
        if (this.getIsJourneyman()) {
            this.setPlayerNumber(newTeamSheetEntryNumber);
            this.setIsJourneyman(false);
        }
    }

    public getIsRefundable(): boolean {
        return this.isRefundable;
    }

    private calculateStat(positionStat: number, statTwoLetterIdentifier: string): number {
        let finalStat = positionStat;
        const skillIncreaseIdentifier = '+' + statTwoLetterIdentifier.toUpperCase();
        const statIncreases = (this.getSkills().filter(skill => skill === skillIncreaseIdentifier)).length;
        if (['+MA', '+ST', '+AV'].includes(skillIncreaseIdentifier)) {
            finalStat += statIncreases;
        } else {
            finalStat -= statIncreases;
        }

        const injuryDecreaseIdentifier = '-' + statTwoLetterIdentifier;
        const injuryDecreases = (this.getInjuries().filter(injury => injury === injuryDecreaseIdentifier)).length;
        if (['-ma', '-st', '-av'].includes(injuryDecreaseIdentifier)) {
            finalStat -= injuryDecreases;
        } else {
            finalStat += injuryDecreases;
        }

        return finalStat;
    }

    public get movementStat(): number {
        return this.calculateStat(this.getPositionStats().Movement, 'ma');
    }

    public get hasMovementIncrease(): boolean {
        return this.movementStat > this.getPositionStats().Movement;
    }

    public get hasMovementDecrease(): boolean {
        return this.movementStat < this.getPositionStats().Movement;
    }

    public get strengthStat(): number {
        return this.calculateStat(this.getPositionStats().Strength, 'st');
    }

    public get hasStrengthIncrease(): boolean {
        return this.strengthStat > this.getPositionStats().Strength;
    }

    public get hasStrengthDecrease(): boolean {
        return this.strengthStat < this.getPositionStats().Strength;
    }

    public get agilityStat(): number {
        return this.calculateStat(this.getPositionStats().Agility, 'ag');
    }

    public get hasAgilityIncrease(): boolean {
        return this.agilityStat < this.getPositionStats().Agility;
    }

    public get hasAgilityDecrease(): boolean {
        return this.agilityStat > this.getPositionStats().Agility;
    }

    public get passingStat(): number | null {
        const passingStat = this.getPositionStats().Passing;
        if (! passingStat) {
            return null;
        }
        return this.calculateStat(passingStat, 'pa');
    }

    public get hasPassingIncrease(): boolean {
        return this.passingStat && this.passingStat < this.getPositionStats().Passing;
    }

    public get hasPassingDecrease(): boolean {
        return this.passingStat && this.passingStat > this.getPositionStats().Passing;
    }

    public get armourStat(): number {
        return this.calculateStat(this.getPositionStats().Armour, 'av');
    }

    public get hasArmourIncrease(): boolean {
        return this.armourStat > this.getPositionStats().Armour;
    }

    public get hasArmourDecrease(): boolean {
        return this.armourStat < this.getPositionStats().Armour;
    }

    public getRecord(): PlayerRecord {
        return this.record;
    }

    public get sppDisplayInfo(): {spendable: number, maxLimit: number, status: PlayerSkillStatus, tier: number, thresholds: {randomPrimary: number, randomSecondaryOrChosenPrimary: number, chosenSecondary: number, characteristic: number}} {
        const numberOfSkills = this.getSkills().length;
        const randomPrimaryThresholds = {0: 3, 1: 4, 2: 6, 3: 8, 4: 10, 5: 15};
        const randomSecondaryOrChosenPrimaryThresholds = {0: 6, 1: 8, 2: 12, 3: 16, 4: 20, 5: 30};
        const chosenSecondaryThresholds = {0: 12, 1: 14, 2: 18, 3: 22, 4: 26, 5: 40};
        const characteristicThresholds = {0: 18, 1: 20, 2: 24, 3: 28, 4: 32, 5: 50};

        return {
            spendable: this.record.spp.total + this.record.spp.extra - this.record.spp.spent,
            maxLimit: this.skillStatus.maxLimit,
            status: this.skillStatus.status,
            tier: this.skillStatus.tier,
            thresholds: {
                randomPrimary: randomPrimaryThresholds[numberOfSkills] ?? 0,
                randomSecondaryOrChosenPrimary: randomSecondaryOrChosenPrimaryThresholds[numberOfSkills] ?? 0,
                chosenSecondary: chosenSecondaryThresholds[numberOfSkills] ?? 0,
                characteristic: characteristicThresholds[numberOfSkills] ?? 0,
            }
        }
    }

    public isMissNextGame(): boolean {
        return this.injuries.includes(Player.missNextGameInjury);
    }

    public isTemporaryPlayer(): boolean {
        return this.getId() === Player.temporaryPlayerId;
    }

    public isTemporaryPlayerWithoutName(): boolean {
        return this.isTemporaryPlayer() && this.getPlayerName() === Player.temporaryPlayerName;
    }

    public increasePlayerNumber() {
        this.playerNumber += 1;
    }

    public decreasePlayerNumber() {
        this.playerNumber -= 1;
    }

    public updatePlayerDetails(updatePlayerDetails: UpdatePlayerDetails) {
        this.playerName = updatePlayerDetails.getPlayerName();
        this.gender = updatePlayerDetails.getGender();
    }

    public hasRosteredPlayer() {
      return true;
    }

    public hasPlayer() {
      return true;
    }
}