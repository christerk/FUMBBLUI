import { TeamStatusValue } from "./Interfaces";

export default class TeamStatus {
  private status: TeamStatusValue = "NEW";

  private statusData = new Map<
    TeamStatusValue,
    { displayName: string; letter: string; style: string; textColour: string }
  >([
    [
      "NEW",
      {
        displayName: "New",
        letter: "N",
        style: "offwhite",
        textColour: "#2f2f2f",
      },
    ],
    [
      "ACTIVE",
      {
        displayName: "Ready to Play",
        letter: "R",
        style: "forest",
        textColour: "white",
      },
    ],
    [
      "READY_FOR_TOURNAMENT",
      {
        displayName: "Ready for Tournament",
        letter: "T",
        style: "apricot",
        textColour: "white",
      },
    ],
    [
      "WAITING_FOR_OPPONENT",
      {
        displayName: "Waiting for Opponent",
        letter: "W",
        style: "jet",
        textColour: "white",
      },
    ],
    [
      "SKILL_ROLLS_PENDING",
      {
        displayName: "Skill Rolls Pending",
        letter: "S",
        style: "carmine",
        textColour: "white",
      },
    ],
    [
      "POST_MATCH_SEQUENCE",
      {
        displayName: "Post-Match",
        letter: "P",
        style: "apricot",
        textColour: "white",
      },
    ],
    [
      "REDRAFTING",
      {
        displayName: "Redrafting",
        letter: "D",
        style: "blueberry",
        textColour: "white",
      },
    ],
    [
      "RETIRED",
      {
        displayName: "Retired",
        letter: "R",
        style: "neutral",
        textColour: "#e0e0e0",
      },
    ],
    [
      "PENDING_APPROVAL",
      {
        displayName: "Reported",
        letter: "A",
        style: "jet",
        textColour: "white",
      },
    ],
    [
      "BLOCKED",
      {
        displayName: "Blocked",
        letter: "B",
        style: "jet",
        textColour: "white",
      },
    ],
    [
      "END_OF_SEASON",
      {
        displayName: "End of Season",
        letter: "E",
        style: "blueberry",
        textColour: "white",
      },
    ],
  ]);

  private displayNames: Map<TeamStatusValue, string> = new Map<
    TeamStatusValue,
    string
  >([
    ["NEW", "New"],
    ["ACTIVE", "Active"],
    ["READY_FOR_TOURNAMENT", "Ready for Tournament"],
    ["WAITING_FOR_OPPONENT", "Waiting for Opponent"],
    ["SKILL_ROLLS_PENDING", "Skill Rolls Pending"],
    ["POST_MATCH_SEQUENCE", "Post-Match"],
    ["REDRAFTING", "Redrafting"],
    ["RETIRED", "Retired"],
    ["PENDING_APPROVAL", "Reported"],
    ["BLOCKED", "Blocked"],
    ["END_OF_SEASON", "End of Season"],
  ]);

  constructor(teamStatusValue: TeamStatusValue) {
    this.status = teamStatusValue;
  }

  static fromApi(rawApiStatus: string): TeamStatus {
    const statusLookup: any = {
      New: "NEW", // Newly created, not yet submitted. Full edit capability
      Active: "ACTIVE", // Ready to Play. Shouldn't be able to do things that affect CTV or on-pitch effects. Should still allow reordering of the players and things like icons / genders of players.
      "Ready for Tournament": "READY_FOR_TOURNAMENT", // Clone of Active (Ready to Play). The only current use is to prevent these teams from being accidentally enrolled into the Blackbox scheduler.
      "Waiting for Opponent": "WAITING_FOR_OPPONENT", // Tournament state, there is a tournament match coming up. Should work much like Active
      "Skill Rolls Pending": "SKILL_ROLLS_PENDING", // A state for teams where skill selection must be made. For 2016, this is just reaching the threshold. For 2020, it's reaching the stat SPP.
      "Post Match Sequence": "POST_MATCH_SEQUENCE", // Post-match. Should allow buying new players (assuming treasury is available)
      "Re-Drafting": "REDRAFTING", // Re-drafting state, editing as per redrafting rules.
      Retired: "RETIRED", // Retired team, no changes allowed (except for staff who can unretire, rename etc)
      "Pending Approval": "PENDING_APPROVAL", // This is a state for teams that have been reported for violating the naming rules. Should be essentially locked until staff has reviewed (except for staff, who need access to the team)
      Blocked: "BLOCKED", // I don't remember fully what this does
      "End of Season": "END_OF_SEASON",
    };

    return new TeamStatus(statusLookup[rawApiStatus]);
  }

  public getStatus() {
    return this.status;
  }

  public get displayName() {
    return this.statusData.get(this.status)?.displayName;
  }
  public get letter() {
    return this.statusData.get(this.status)?.letter;
  }

  public get textColour() {
    return this.statusData.get(this.status)?.textColour;
  }

  public get style() {
    return this.statusData.get(this.status)?.style;
  }

  public isNew(): boolean {
    return this.status === "NEW";
  }

  public isActive(): boolean {
    return ["ACTIVE", "WAITING_FOR_OPPONENT"].includes(this.status);
  }

  public isRetired(): boolean {
    return this.status === "RETIRED";
  }

  public isPostMatch(): boolean {
    return this.status === "POST_MATCH_SEQUENCE";
  }

  public isReadyForTournament(): boolean {
    return this.status === "READY_FOR_TOURNAMENT";
  }

  public isSkill(): boolean {
    return this.status === "SKILL_ROLLS_PENDING";
  }

  public isRedrafting(): boolean {
    return this.status === "REDRAFTING";
  }

  public isEndSeason(): boolean {
    return this.status === "END_OF_SEASON";
  }
}
