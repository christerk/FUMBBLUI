import {
  ActionGrantAccessTo,
  TeamAction,
  TeamStatusValue,
  UserRole,
} from "./Interfaces";

export default class AccessControl {
  private accessRules: ActionGrantAccessTo[] = [];
  private userRoles: UserRole[] = [];
  private teamStatus: TeamStatusValue = "RETIRED";

  constructor(userRoles: UserRole[], teamStatus: TeamStatusValue) {
    this.userRoles = userRoles;
    this.teamStatus = teamStatus;

    this.accessRules.push(
      {
        action: "CREATE",
        grantAccessToList: [
          {
            userRoles: ["OWNER"],
            teamStatusValues: ["NEW"],
          },
        ],
      },
      {
        action: "HIRE_ROOKIE",
        grantAccessToList: [
          {
            userRoles: ["OWNER"],
            teamStatusValues: [
              "NEW",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
            ],
          },
        ],
      },
      {
        action: "RENUMBER_PLAYERS",
        grantAccessToList: [
          {
            userRoles: ["OWNER"],
            teamStatusValues: [
              "NEW",
              "ACTIVE",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
              "READY_FOR_TOURNAMENT",
            ],
          },
        ],
      },
      {
        action: "EDIT",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: [
              "NEW",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
            ],
          },
        ],
      },
      {
        action: "READY_TEAM",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["POST_MATCH_SEQUENCE"],
          },
        ],
      },
      {
        action: "RETIRE_TEAM",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["ACTIVE", "READY_FOR_TOURNAMENT"],
          },
        ],
      },
      {
        action: "VIEW_HISTORY",
        grantAccessToList: [
          {
            userRoles: ["ANYONE"],
            teamStatusValues: [
              "ACTIVE",
              "READY_FOR_TOURNAMENT",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
            ],
          },
        ],
      },
      {
        action: "SHOW_PLAYER_CONTROLS",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: [
              "NEW",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
              "REDRAFTING",
            ],
          },
        ],
      },
      {
        action: "EDIT_BIO",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: [
              "NEW",
              "ACTIVE",
              "READY_FOR_TOURNAMENT",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
              "REDRAFTING",
            ],
          },
        ],
      },
      {
        action: "REPORT",
        grantAccessToList: [
          {
            userRoles: ["NOT_OWNER"],
            teamStatusValues: [
              "NEW",
              "ACTIVE",
              "READY_FOR_TOURNAMENT",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
              "REDRAFTING",
            ],
          },
        ],
      },
    );
  }

  private isGranted(teamAction: TeamAction): boolean {
    for (const actionGrantAccessTo of this.accessRules) {
      if (teamAction !== actionGrantAccessTo.action) {
        continue;
      }

      for (const grantAccessTo of actionGrantAccessTo.grantAccessToList) {
        if (!grantAccessTo.teamStatusValues.includes(this.teamStatus)) {
          continue;
        }

        for (const coachUserRole of this.userRoles) {
          if (grantAccessTo.userRoles.includes(coachUserRole)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private isGrantedAny(teamActions: TeamAction[]): boolean {
    for (const teamAction of teamActions) {
      if (this.isGranted(teamAction)) {
        return true;
      }
    }
    return false;
  }

  public canEdit(): boolean {
    return this.isGrantedAny(["CREATE", "EDIT"]);
  }

  public canRetireTeam(): boolean {
    return this.isGrantedAny(["RETIRE_TEAM"]);
  }

  public canReadyTeam(): boolean {
    return this.isGranted("READY_TEAM");
  }

  public canCreate(): boolean {
    return this.isGranted("CREATE");
  }

  public canViewHistory(): boolean {
    return this.isGranted("VIEW_HISTORY");
  }

  public canHireRookie(): boolean {
    return this.isGranted("HIRE_ROOKIE");
  }

  public canRenumberPlayers(): boolean {
    return this.isGranted("RENUMBER_PLAYERS");
  }

  public canShowPlayerControls(): boolean {
    return this.isGranted("SHOW_PLAYER_CONTROLS");
  }

  public canEditBio(): boolean {
    return this.isGranted("EDIT_BIO");
  }

  public canReport(): boolean {
    return this.isGranted("REPORT");
  }
}
