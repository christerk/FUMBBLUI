export interface DemoTeamSettings {
  existingTeamId: number;
}

export interface RawApiSpecialRules {
  fromRoster: any;
  fromTeam: any;
}

export type UserRole =
  | "ANYONE"
  | "ANONYMOUS"
  | "LOGGED_IN"
  | "OWNER"
  | "NOT_OWNER"
  | "LEAGUE_STAFF"
  | "SITE_STAFF";

export type TeamStatusValue =
  | "NEW"
  | "ACTIVE"
  | "READY_FOR_TOURNAMENT"
  | "PENDING_APPROVAL"
  | "BLOCKED"
  | "RETIRED"
  | "WAITING_FOR_OPPONENT"
  | "SKILL_ROLLS_PENDING"
  | "POST_MATCH_SEQUENCE"
  | "REDRAFTING"
  | "END_OF_SEASON";

export type TeamAction =
  | "CREATE"
  | "EDIT"
  | "RETIRE_TEAM"
  | "UNRETIRE_TEAM"
  | "READY_TEAM"
  | "UNREADY_TEAM"
  | "VIEW_HISTORY"
  | "HIRE_ROOKIE"
  | "RENUMBER_PLAYERS"
  | "SHOW_PLAYER_CONTROLS"
  | "EDIT_BIO"
  | "REPORT"
  | "SHOW_ADMIN_MENU"
  | "MAGIC_FIX"
  | "RENAME_TEAM"
  | "SET_TREASURY"
  | "SET_DEDICATED_FANS"
  | "RENAME_ALL_PLAYERS"
  | "SKILL"
  | "REMOVE_REROLL"
  | "REMOVE_COACH"
  | "REMOVE_CHEERLEADER"
  | "REMOVE_APOTHECARY"
  | "REDRAFT_TEAM"
  | "CANCEL_REDRAFT_TEAM"
  | "END_SEASON"
  | "UNDO_END_SEASON"
  | "UNDO_TEMP_RETIRE"
  | "MIGRATE_TEAM";

export type ActionGrantAccessTo = {
  action: TeamAction;
  grantAccessToList: GrantAccessTo[];
};

export type GrantAccessTo = {
  enabled?: boolean;
  userRoles: UserRole[];
  teamStatusValues: TeamStatusValue[];
};

export type PlayerType = "EMPTY" | "TEMP" | "NORMAL";

export type PlayerRowFoldOutMode = "BUY" | "MORE" | "CLOSED";

export type PlayerGender = "FEMALE" | "MALE" | "NEUTRAL" | "NONBINARY";

export type PlayerSkillStatus = "NONE" | "CAN_SKILL" | "MUST_SKILL";

export type RulesetVersion = "UNKNOWN" | "2016" | "2020" | "2025";
export type SkillProgression =
  | "UNKNOWN"
  | "NONE"
  | "PREDETERMINED"
  | "BB2016"
  | "CUSTOMSPP"
  | "BB2020";

export interface Coach {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
  cost: number;
  skills: string[];
  stats: PositionStats;
  quantityAllowed: number;
  isBigGuy: boolean;
  defaultGender: string;
  isPeaked: boolean;
  primarySkills: string[];
  secondarySkills: string[];
}

export interface PositionDataForBuyingPlayer {
  positionId: number;
  quantityHired: number;
  canAfford: boolean;
  position: Position;
}

export interface PositionStats {
  Movement: number;
  Strength: number;
  Agility: number;
  Passing: number | null;
  Armour: number;
}

export interface PlayerRecord {
  seasons: number;
  games: number;
  completions: number;
  touchdowns: number;
  interceptions: number;
  deflections: number;
  casualties: number;
  mvps: number;
  spp: {
    total: number;
    extra: number;
    spent: number;
  };
}

export interface JourneymanQuantityChoice {
  positionId: number;
  quantity: number;
}

export interface JourneymanQuantityInput extends JourneymanQuantityChoice {
  positionName: string;
}

export interface SetupTeamManagementSettings {
  roster: {
    name: string;
    logoId: {
      large: number;
    };
  };
  treasury: {
    start: number;
  };
  players: {
    start: number;
    max: number;
    maxBigGuys: number;
    lowCostLinemen: boolean;
    nameGenerator: string;
    positions: Position[];
  };
  dedicatedFans: {
    start: number;
    minStart: number;
    maxStart: number;
    cost: number;
  };
  rerolls: {
    max: number;
    cost: number;
  };
  sidelineStaff: {
    assistantCoaches: {
      max: number;
      cost: number;
    };
    cheerleaders: {
      max: number;
      cost: number;
    };
    apothecary: {
      allowed: boolean;
      cost: number;
    };
  };
  seasons: {
    enabled: boolean;
    seasonLength: number;
    agentFee: {
      base: number;
      perSeason: number;
      seasonModifier: number;
    };
  };
  ruleset: {
    version: string;
    expensiveMistakes: {
      enabled: boolean;
      start: number;
    };
    isProgression: boolean;
    minPlayers: number;
  };
}

export interface AddRemovePermissions {
  rerolls: {
    add: boolean;
    remove: boolean;
  };
  assistantCoaches: {
    add: boolean;
    remove: boolean;
  };
  cheerleaders: {
    add: boolean;
    remove: boolean;
  };
  apothecary: {
    add: boolean;
    remove: boolean;
  };
  dedicatedFans: {
    add: boolean;
    remove: boolean;
  };
}

export interface ModalButtonSettings {
  cancel: { enabled: boolean; label: string };
  confirm: { enabled: boolean; label: string };
  extra: { enabled: boolean; label: string }[];
}
