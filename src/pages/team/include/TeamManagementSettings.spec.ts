import { describe, expect, it, beforeEach } from "vitest";
import Team from "./Team";
import { PlayerType, Position } from "./Interfaces";
import Player from "./Player";
import TeamManagementSettings from './TeamManagementSettings';

let team: Team;
let teamManagementSettings: TeamManagementSettings
const rawApiRuleset = buildApiRuleset()
const rawApiRoster = buildApiRoster()

describe("TeamManagementSettings", () => {
  beforeEach(() => {

    teamManagementSettings = new TeamManagementSettings(rawApiRuleset, rawApiRoster, true)
    team = new Team("mock division", 3, 100000, 16);
    let counter = 1;
    team.addPlayer(buildPlayer(counter++, "NORMAL", blitzer, 10000));
    team.addPlayer(buildPlayer(counter++, "NORMAL", blitzer, 0));
    team.addPlayer(buildPlayer(counter++, "NORMAL", lino, 0));
    team.addPlayer(buildPlayer(counter++, "NORMAL", lino, 0));
    team.addPlayer(buildPlayer(counter++, "NORMAL", lino, 20000));
    team.addPlayer(buildPlayer(counter++, "NORMAL", lino, 0));
    team.addPlayer(buildPlayer(counter++, "TEMP", lino, 0));
    team.addPlayer(buildPlayer(counter++, "NORMAL", lino, 0));
    team.addPlayer(buildPlayer(counter++, "NORMAL", lino, 0, true));
    team.addPlayer(buildPlayer(counter++, "EMPTY", lino, 0));
    team.addPlayer(buildPlayer(counter++, "EMPTY", lino, 0));
    team.addPlayer(buildPlayer(counter++, "EMPTY", lino, 0));
    team.addPlayer(buildPlayer(counter++, "EMPTY", lino, 0));
    team.addPlayer(buildPlayer(counter++, "EMPTY", lino, 0));
    team.addPlayer(buildPlayer(counter++, "EMPTY", lino, 0));
    team.addPlayer(buildPlayer(counter++, "EMPTY", lino, 0));
    team.addPlayer(buildPlayer(counter++, "TEMP", lino, 0));
    team.addApothecary(50000);
    team.addAssistantCoach(1);
    team.addCheerleader(2);
    team.addDedicatedFans(6);
    team.addReroll(60000);
});
  describe("calculateTeamValue", () => {
    it("adds all rostered players and team goods", () => {

      const expectedCost = 
      blitzer.cost * 2 + 
      lino.cost * 6 + 
      10000 + // blitzer skill
      20000 + // lino skill
      50000 + // apo
      10000 + // AC
      20000 + // CL
      60000 * 3; // RR

    expect(teamManagementSettings.calculateTeamValue(team)).toBe(expectedCost)
    });
  });
});

function buildPlayer(
  id: number,
  playerType: PlayerType,
  position: Position,
  skillCost: number,
  missing: boolean = false,
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
    player['injuries'] = ['m']
  }
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
            rulesetOptions: {

            },
            teamSettings: {

            }
        }
    }
}

function buildApiRoster(): any {
    return {
        positions: [],
        logos: new Array<number>(200)
    }
}

