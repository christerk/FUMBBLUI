import {
  PlayerGender,
  PlayerRecord,
  PlayerRowFoldOutMode,
  PlayerSkillStatus,
  PlayerType,
  Position,
  PositionStats,
} from "./Interfaces";
import Team from "./Team";
import UpdatePlayerDetails from "./UpdatePlayerDetails";

export default class Player {
  private static readonly temporaryPlayerId = 0;
  private static readonly temporaryPlayerName = "Temporary Player";
  private static generatedId = 0;
  static missNextGameInjury = "m";

  public playerNumber: number = 0;
  private playerName: string;
  private _hasBio: boolean = false;
  public playerStatus: number = 0;
  private gender: PlayerGender = "NEUTRAL";
  private iconRowVersionPosition: number; // allows selection of icon for display when position has multiple versions in the icon image
  private position: Position | null;
  private injuries: string[] = [];
  private skills: string[] = [];
  private record: PlayerRecord;
  private skillStatus: {
    status: PlayerSkillStatus;
    maxLimit: number;
    tier: number;
  } | null = null;
  private skillCost: number = 0;
  private skillRewards: number = 0;
  private isJourneyman: boolean = false;
  private isRefundable: boolean = true;
  public foldOut: PlayerRowFoldOutMode = "CLOSED";

  private type: PlayerType = "NORMAL";
  public id: number = 0;
  private version: number = 0;
  private numberOfSkillsForLegend: number = 9999;
  team: Team;

  constructor(
    team: Team,
    type: PlayerType,
    id: number,
    playerNumber: number,
    playerName: string,
    position: Position | null,
    iconRowVersionPosition: number,
    gender: PlayerGender,
    hasBio: boolean,
    playerStatus: number,
  ) {
    this.team = team;
    this.type = type;
    this.id = id;
    this.version = 0;

    this.playerNumber = playerNumber;
    this.playerName = playerName;
    this.position = position;
    this.iconRowVersionPosition = iconRowVersionPosition;
    this.gender = gender;
    this._hasBio = hasBio;
    this.playerStatus = playerStatus;

    this.injuries = [];
    this.skills = [];

    this.record = {
      seasons: 0,
      games: 0,
      completions: 0,
      touchdowns: 0,
      interceptions: 0,
      deflections: 0,
      casualties: 0,
      mvps: 0,
      spp: { total: 0, extra: 0, spent: 0 },
    };

    this.skillStatus = {
      status: "NONE",
      maxLimit: 0,
      tier: 0,
    };
  }

  static fromApi(
    team: Team,
    rawApiPlayer: any,
    position: Position,
    iconRowVersionPosition: number,
    isJourneyman: boolean,
    numberOfSkillsForLegend: number,
    hasBio: boolean,
    playerStatus: number,
  ): Player {
    const player = new Player(
      team,
      "NORMAL",
      rawApiPlayer.id,
      rawApiPlayer.number,
      rawApiPlayer.name,
      position,
      iconRowVersionPosition,
      rawApiPlayer.gender ? rawApiPlayer.gender.toUpperCase() : "NONBINARY", // older journeymen have null gender
      hasBio,
      playerStatus,
    );
    player.isJourneyman = isJourneyman;
    player.injuries = rawApiPlayer.injuries
      .split(",")
      .filter((injury: string) => injury !== "");
    player.skills = rawApiPlayer.skills;

    player.skillCost = rawApiPlayer.skillCosts.reduce(
      (totalCost: number, skillCost: number) => (totalCost += skillCost),
      0,
    );

    player.skillRewards = rawApiPlayer.skillStatus.numRewards;

    player.record.seasons = rawApiPlayer.record.seasons;
    player.record.games = rawApiPlayer.record.games;
    player.record.completions = rawApiPlayer.record.completions;
    player.record.touchdowns = rawApiPlayer.record.touchdowns;
    player.record.deflections = rawApiPlayer.record.deflections;
    player.record.interceptions = rawApiPlayer.record.interceptions;
    player.record.casualties = rawApiPlayer.record.casualties;
    player.record.mvps = rawApiPlayer.record.mvps;
    player.record.spp = {
      total: rawApiPlayer.record.spp,
      extra: rawApiPlayer.record.extra_spp,
      spent: rawApiPlayer.record.spent_spp,
    };

    const skillStatusLookup: { [key: string]: PlayerSkillStatus } = {
      none: "NONE",
      canSkill: "CAN_SKILL",
      mustSkill: "MUST_SKILL",
    };
    player.skillStatus = {
      status: skillStatusLookup[rawApiPlayer.skillStatus.status],
      maxLimit: rawApiPlayer.skillStatus.maxLimit,
      tier: rawApiPlayer.skillStatus.tier,
    };
    player.numberOfSkillsForLegend = numberOfSkillsForLegend;

    player.isRefundable = rawApiPlayer.refundable;

    return player;
  }

  static emptyPlayer(team: Team, number: number) {
    return new Player(
      team,
      "EMPTY",
      ++this.generatedId,
      number,
      "Empty",
      null,
      0,
      "NEUTRAL",
      false,
      0,
    );
  }

  static temporaryPlayer(
    team: Team,
    playerNumber: number,
    position: Position,
    iconRowVersionPosition: number,
    playerGender: PlayerGender,
  ): Player {
    return new Player(
      team,
      "TEMP",
      ++this.generatedId,
      playerNumber,
      Player.temporaryPlayerName,
      position,
      iconRowVersionPosition,
      playerGender,
      false,
      0,
    );
  }

  public get isTemporaryPlayer() {
    return this.type == "TEMP";
  }

  public getId(): number {
    return this.id;
  }

  public get key(): string {
    return this.type + ":" + this.id + ":" + this.version;
  }

  public setIdForTemporaryPlayer(playerId: number) {
    if (this.isTemporaryPlayer) {
      this.id = playerId;
      this.type = "NORMAL";
    }
  }

  public get number(): number {
    return this.playerNumber;
  }

  public get IsEmpty(): boolean {
    return this.type == "EMPTY";
  }

  public get IsExtraPlayer(): boolean {
    return this.isJourneyman || this.number > 16;
  }

  public get IsFired(): boolean {
    return this.playerStatus == 11;
  }

  public set number(value) {
    this.playerNumber = value;
  }

  public get IsLegend(): boolean {
    return (
      this.numberOfSkillsForLegend > 0 &&
      this.skills.length - this.skillRewards >= this.numberOfSkillsForLegend
    );
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
    this.version++;
  }

  public getPosition(): Position | null {
    return this.position;
  }

  public getGender(): PlayerGender {
    return this.gender;
  }

  public getPositionId(): number {
    return this.position?.id ?? 0;
  }

  public getPositionName(): string {
    return this.position?.name ?? "Empty";
  }

  public getDisplayPositionName(): string {
    const journeymanPrefix = this.getIsJourneyman() ? "Journeyman " : "";
    return journeymanPrefix + this.getPositionName();
  }

  public getPositionCost(): number {
    return this.position?.cost ?? 0;
  }

  public getPositionStats(): PositionStats {
    return (
      this.position?.stats ?? {
        Movement: 0,
        Strength: 0,
        Agility: 0,
        Passing: 0,
        Armour: 0,
      }
    );
  }

  public getPositionSkills(): string[] {
    return this.position?.skills ?? [];
  }

  public getSkillCost(): number {
    return this.skillCost;
  }

  public getAgentFee(): number {
    return this.team.getAgentFee(this);
  }
  public getRedraftingCost(): number {
    const baseCost = this.getPlayerCost();

    const agentFee = this.team.getAgentFee(this);

    return baseCost + agentFee;
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

  public permanentlyHireJourneyman(playerNumber: number) {
    if (this.getIsJourneyman()) {
      this.setPlayerNumber(playerNumber);
      this.setIsJourneyman(false);
      this.isRefundable = true;
    }
  }

  public getIsRefundable(): boolean {
    return this.isRefundable;
  }

  public hasBio(): boolean {
    return this._hasBio;
  }

  private calculateStat(
    positionStat: number,
    statTwoLetterIdentifier: string,
  ): number {
    let finalStat = positionStat;
    const skillIncreaseIdentifier = "+" + statTwoLetterIdentifier.toUpperCase();
    const statIncreases = this.getSkills().filter(
      (skill) => skill === skillIncreaseIdentifier,
    ).length;
    if (["+MA", "+ST", "+AV"].includes(skillIncreaseIdentifier)) {
      finalStat += statIncreases;
    } else {
      finalStat -= statIncreases;
    }

    const injuryDecreaseIdentifier = "-" + statTwoLetterIdentifier;
    const injuryDecreases = this.getInjuries().filter(
      (injury) => injury === injuryDecreaseIdentifier,
    ).length;
    if (["-ma", "-st", "-av"].includes(injuryDecreaseIdentifier)) {
      finalStat -= injuryDecreases;
    } else {
      finalStat += injuryDecreases;
    }

    return finalStat;
  }

  public get movementStat(): number {
    return this.calculateStat(this.getPositionStats().Movement, "ma");
  }

  public get hasMovementIncrease(): boolean {
    return this.movementStat > this.getPositionStats().Movement;
  }

  public get hasMovementDecrease(): boolean {
    return this.movementStat < this.getPositionStats().Movement;
  }

  public get strengthStat(): number {
    return this.calculateStat(this.getPositionStats().Strength, "st");
  }

  public get hasStrengthIncrease(): boolean {
    return this.strengthStat > this.getPositionStats().Strength;
  }

  public get hasStrengthDecrease(): boolean {
    return this.strengthStat < this.getPositionStats().Strength;
  }

  public get agilityStat(): number {
    return this.calculateStat(this.getPositionStats().Agility, "ag");
  }

  public get hasAgilityIncrease(): boolean {
    return this.agilityStat < this.getPositionStats().Agility;
  }

  public get hasAgilityDecrease(): boolean {
    return this.agilityStat > this.getPositionStats().Agility;
  }

  public get passingStat(): number | null {
    const passingStat = this.getPositionStats().Passing;
    if (!passingStat) {
      return null;
    }
    return this.calculateStat(passingStat, "pa");
  }

  public get hasPassingIncrease(): boolean {
    const positionStats: PositionStats = this.getPositionStats();
    return (
      this.passingStat != null &&
      positionStats != null &&
      positionStats.Passing != null &&
      this.passingStat < positionStats.Passing
    );
  }

  public get hasPassingDecrease(): boolean {
    const positionStats: PositionStats = this.getPositionStats();

    return (
      this.passingStat != null &&
      positionStats != null &&
      positionStats.Passing != null &&
      this.passingStat > positionStats.Passing
    );
  }

  public get armourStat(): number {
    return this.calculateStat(this.getPositionStats().Armour, "av");
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

  public sppDisplayInfo(): {
    total: number;
    spendable: number;
    maxLimit: number;
    status: PlayerSkillStatus;
    tier: number;
    thresholds: {
      randomPrimary: number;
      randomSecondaryOrChosenPrimary: number;
      chosenSecondary: number;
      characteristic: number;
    };
  } {
    const numberOfSkills = this.getSkills().length - this.skillRewards;
    const randomPrimaryThresholds: { [key: number]: number } = {
      0: 3,
      1: 4,
      2: 6,
      3: 8,
      4: 10,
      5: 15,
    };
    const randomSecondaryOrChosenPrimaryThresholds: { [key: number]: number } =
      {
        0: 6,
        1: 8,
        2: 12,
        3: 16,
        4: 20,
        5: 30,
      };
    const chosenSecondaryThresholds: { [key: number]: number } = {
      0: 12,
      1: 14,
      2: 18,
      3: 22,
      4: 26,
      5: 40,
    };
    const characteristicThresholds: { [key: number]: number } = {
      0: 18,
      1: 20,
      2: 24,
      3: 28,
      4: 32,
      5: 50,
    };

    return {
      total: this.record.spp.total,
      spendable: this.record.spp.total - this.record.spp.spent,
      maxLimit: this.skillStatus?.maxLimit ?? 0,
      status: this.skillStatus?.status ?? "NONE",
      tier: this.skillStatus?.tier ?? 0,
      thresholds: {
        randomPrimary: randomPrimaryThresholds[numberOfSkills] ?? 0,
        randomSecondaryOrChosenPrimary:
          randomSecondaryOrChosenPrimaryThresholds[numberOfSkills] ?? 0,
        chosenSecondary: chosenSecondaryThresholds[numberOfSkills] ?? 0,
        characteristic: characteristicThresholds[numberOfSkills] ?? 0,
      },
    };
  }

  public addSkill(skill: string) {
    this.skills.push(skill);
  }

  public get canSkill(): boolean {
    const info = this.sppDisplayInfo();
    return info.tier > 0;
  }

  public get mustSkill(): boolean {
    const info = this.sppDisplayInfo();
    return info.tier >= 4;
  }

  public isMissNextGame(): boolean {
    return this.injuries.includes(Player.missNextGameInjury);
  }

  public isTemporaryPlayerWithoutName(): boolean {
    return (
      this.isTemporaryPlayer &&
      this.getPlayerName() === Player.temporaryPlayerName
    );
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
}
