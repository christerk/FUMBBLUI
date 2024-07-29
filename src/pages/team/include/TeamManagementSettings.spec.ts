import { describe, expect, it, beforeEach, test } from "vitest";
import Team from "./Team";
import { PlayerType, Position } from "./Interfaces";
import Player from "./Player";
import TeamManagementSettings from "./TeamManagementSettings";

const rerollCost = 60000;
const apoCost = 50000;
const acCost = 10000;
const clCost = 10000;

let team: Team;
let teamManagementSettings: TeamManagementSettings;
const rawApiRuleset = buildApiRuleset();
const rawApiRoster = buildApiRoster();

describe.each([
  { lcl: false, desc: "w/o lcl", linosTv: 6, linosCtv: 6, linosCtvAr: 9 },
  { lcl: true, desc: "with lcl", linosTv: 6, linosCtv: 6, linosCtvAr: 0 },
])("TeamManagementSettings $desc", ({ lcl, linosTv, linosCtv, linosCtvAr }) => {
  beforeEach(() => {
    teamManagementSettings = new TeamManagementSettings(
      rawApiRuleset,
      rawApiRoster,
      lcl,
    );
    teamManagementSettings["settings"].players.positions = [blitzer, lino]
    team = new Team("mock division", 3, 100000, 16);
    let counter = 1;
    team.addPlayer(buildPlayer(counter++, false, blitzer, 10000));
    team.addPlayer(buildPlayer(counter++, false, blitzer, 0));
    team.addPlayer(buildPlayer(counter++, false, blitzer, 0, true));
    team.addPlayer(buildPlayer(counter++, false, lino, 0));
    team.addPlayer(buildPlayer(counter++, false, lino, 0));
    team.addPlayer(buildPlayer(counter++, false, lino, 20000));
    team.addPlayer(buildPlayer(counter++, false, lino, 0));
    team.addPlayer(buildPlayer(counter++, true, lino, 0));
    team.addPlayer(buildPlayer(counter++, false, lino, 0));
    team.addPlayer(buildPlayer(counter++, false, lino, 20000, true));
    team.addPlayer(buildEmptySlot(counter++));
    team.addPlayer(buildEmptySlot(counter++));
    team.addPlayer(buildEmptySlot(counter++));
    team.addPlayer(buildEmptySlot(counter++));
    team.addPlayer(buildEmptySlot(counter++));
    team.addPlayer(buildEmptySlot(counter++));
    team.addApothecary(apoCost);
    team.addAssistantCoach(acCost);
    team.addCheerleader(clCost);
    team.addCheerleader(clCost);
    team.addDedicatedFans(6);
    team.addReroll(rerollCost);
    team.addReroll(rerollCost);
    team.addReroll(rerollCost);
  });
  describe("calculateTeamValue", () => {
    it("adds all rostered players and team goods", () => {
      const expectedCost =
        blitzer.cost * 3 +
        lino.cost * linosTv +
        10000 + // blitzer skill
        20000 + // lino skill
        20000 + // lino mng skill
        apoCost +
        acCost +
        2 * clCost +
        rerollCost * 3;

      expect(teamManagementSettings.calculateTeamValue(team)).toBe(
        expectedCost,
      );
    });
  });

  describe("calculateCurrentTeamValue", () => {
    it("adds all rostered players not mng and team goods", () => {
      const expectedCost =
        blitzer.cost * 2 +
        lino.cost * linosCtv +
        10000 + // blitzer skill
        20000 + // lino skill
        apoCost +
        acCost +
        2 * clCost +
        rerollCost * 3;

      expect(teamManagementSettings.calculateCurrentTeamValue(team)).toBe(
        expectedCost,
      );
    });
  });

  describe("calculateCurrentTeamValueAfterReady", () => {
    it("adds all rostered players not mng and team goods", () => {
      const expectedCost =
        blitzer.cost * 2 +
        lino.cost * linosCtvAr +
        10000 + // blitzer skill
        (lcl ? 0 :20000) + // lino skill
        apoCost +
        acCost +
        2 * clCost +
        rerollCost * 3;

      expect(
        teamManagementSettings.calculateCurrentTeamValueAfterReady(team),
      ).toEqual([expectedCost]);
    });
  });
});

function buildPlayer(
  id: number,
  isJourneyman: boolean,
  position: Position,
  skillCost: number,
  missing: boolean = false,

) {
  return buildPlayerSlot(id, isJourneyman, position, skillCost, missing, "NORMAL");
}

function buildEmptySlot(id: number) {
  return buildPlayerSlot(id, false, null, 0, false, "EMPTY")
}

function buildPlayerSlot(
  id: number,
  isJourneyman: boolean,
  position: Position | null,
  skillCost: number,
  missing: boolean,
  playerType: PlayerType
): Player {
  const player = new Player(
    team,
    playerType,
    id,
    id,
    id + "",
    position,
    0,
    "NEUTRAL",
    false,
    0,
  );
  player["skillCost"] = skillCost;
  if (missing) {
    player["injuries"] = ["m"];
  }
  player.setIsJourneyman(isJourneyman);
  return player;
}

const lino: Position = {
  id: 1,
  name: "lino",
  cost: 70000,
  skills: [],
  stats: {
    Movement: 7,
    Strength: 3,
    Agility: 2,
    Passing: 5,
    Armour: 9,
  },
  quantityAllowed: 16,
  isPeaked: false,
  defaultGender: "NEUTRAL",
  isBigGuy: false,
  primarySkills: [],
  secondarySkills: [],
};

const blitzer: Position = {
  id: 2,
  name: "blitzer",
  cost: 120000,
  skills: [],
  stats: {
    Movement: 7,
    Strength: 3,
    Agility: 2,
    Passing: 5,
    Armour: 9,
  },
  quantityAllowed: 4,
  isPeaked: false,
  defaultGender: "NEUTRAL",
  isBigGuy: false,
  primarySkills: [],
  secondarySkills: [],
};

function buildApiRuleset(): any {
  return {
    options: {
      rulesetOptions: {},
      teamSettings: {},
      clientOptions: {
        playersOnField: 11
      }
    },
  };
}

function buildApiRoster(): any {
  const roster = {
    positions: [],
    logos: new Array<number>(200),
    rerollCost: rerollCost
  };

  return roster;
}
