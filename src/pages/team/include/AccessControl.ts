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
  private isProgression: boolean = true;

  constructor(
    userRoles: UserRole[],
    teamStatus: TeamStatusValue,
    isProgression: boolean,
  ) {
    this.userRoles = userRoles;
    this.teamStatus = teamStatus;
    this.isProgression = isProgression;

    if (this.isProgression) {
      this.accessRules.push(
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
      );
    } else {
      this.accessRules.push(
        {
          action: "EDIT",
          grantAccessToList: [
            {
              userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
              teamStatusValues: ["NEW"],
            },
          ],
        },
        {
          action: "HIRE_ROOKIE",
          grantAccessToList: [
            {
              userRoles: ["OWNER"],
              teamStatusValues: ["NEW"],
            },
          ],
        },
      );
    }

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
        action: "READY_TEAM",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["POST_MATCH_SEQUENCE", "READY_FOR_TOURNAMENT"],
          },
        ],
      },
      {
        action: "UNREADY_TEAM",
        grantAccessToList: [
          {
            userRoles: ["LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["ACTIVE"],
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
              "RETIRED",
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
              "RETIRED",
            ],
          },
        ],
      },
      {
        action: "SHOW_ADMIN_MENU",
        grantAccessToList: [
          {
            userRoles: ["LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: [
              "NEW",
              "ACTIVE",
              "READY_FOR_TOURNAMENT",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
              "REDRAFTING",
              "RETIRED",
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

  public canShowAdminMenu(): boolean {
    return this.isGranted("SHOW_ADMIN_MENU");
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

  public canUnreadyTeam(): boolean {
    return this.isGranted("UNREADY_TEAM");
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
