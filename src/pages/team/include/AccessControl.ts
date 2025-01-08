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
                "REDRAFTING",
              ],
            },
          ],
        },
        {
          action: "HIRE_ROOKIE",
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
          action: "SKILL",
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
              userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
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
        action: "REMOVE_REROLL",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["NEW", "REDRAFTING"],
          },
        ],
      },
      {
        action: "REMOVE_COACH",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["NEW", "REDRAFTING"],
          },
        ],
      },
      {
        action: "REMOVE_CHEERLEADER",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["NEW", "REDRAFTING"],
          },
        ],
      },
      {
        action: "REMOVE_APOTHECARY",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["NEW", "REDRAFTING"],
          },
        ],
      },
      {
        action: "RENUMBER_PLAYERS",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: [
              "NEW",
              "ACTIVE",
              "POST_MATCH_SEQUENCE",
              "SKILL_ROLLS_PENDING",
              "READY_FOR_TOURNAMENT",
              "REDRAFTING",
              "END_OF_SEASON",
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
        action: "RENAME_TEAM",
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
              "END_OF_SEASON",
            ],
          },
        ],
      },
      {
        action: "SET_TREASURY",
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
              "END_OF_SEASON",
            ],
          },
        ],
      },
      {
        action: "SET_DEDICATED_FANS",
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
              "END_OF_SEASON",
            ],
          },
        ],
      },
      {
        action: "RENAME_ALL_PLAYERS",
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
              "END_OF_SEASON",
            ],
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
        action: "UNRETIRE_TEAM",
        grantAccessToList: [
          {
            userRoles: ["LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["RETIRED"],
          },
        ],
      },
      {
        action: "REDRAFT_TEAM",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["END_OF_SEASON"],
          },
        ],
      },
      {
        action: "END_SEASON",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["ACTIVE"],
          },
        ],
      },
      {
        action: "UNDO_END_SEASON",
        grantAccessToList: [
          {
            userRoles: ["LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["END_OF_SEASON"],
          },
        ],
      },
      {
        action: "CANCEL_REDRAFT_TEAM",
        grantAccessToList: [
          {
            userRoles: ["LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: ["REDRAFTING"],
          },
        ],
      },
      {
        action: "MAGIC_FIX",
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
              "END_OF_SEASON",
            ],
          },
        ],
      },
      {
        action: "RETIRE_TEAM",
        grantAccessToList: [
          {
            userRoles: ["OWNER", "LEAGUE_STAFF", "SITE_STAFF"],
            teamStatusValues: [
              "ACTIVE",
              "READY_FOR_TOURNAMENT",
              "END_OF_SEASON",
            ],
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
              "REDRAFTING",
              "END_OF_SEASON",
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
              "END_OF_SEASON",
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
              "END_OF_SEASON",
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
              "END_OF_SEASON",
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

  public canSkill(): boolean {
    return this.isGrantedAny(["SKILL"]);
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

  public canUnretireTeam(): boolean {
    return this.isGranted("UNRETIRE_TEAM");
  }

  public canRedraft(): boolean {
    return this.isGranted("REDRAFT_TEAM");
  }

  public canUndoEndSeason(): boolean {
    return this.isGranted("UNDO_END_SEASON");
  }

  public canEndSeason(): boolean {
    return this.isGranted("END_SEASON");
  }

  public canCancelRedraft(): boolean {
    return this.isGranted("CANCEL_REDRAFT_TEAM");
  }
  public canRenameTeam(): boolean {
    return this.isGranted("RENAME_TEAM");
  }

  public canSetTreasury(): boolean {
    return this.isGranted("SET_TREASURY");
  }

  public canSetDedicatedFans(): boolean {
    return this.isGranted("SET_DEDICATED_FANS");
  }

  public canRenameAllPlayers(): boolean {
    return this.isGranted("RENAME_ALL_PLAYERS");
  }

  public canMagicFixTeam(): boolean {
    return this.isGranted("MAGIC_FIX");
  }

  public canCreate(): boolean {
    return this.isGranted("CREATE");
  }

  public canRemoveReroll(): boolean {
    return this.isGranted("REMOVE_REROLL");
  }

  public canRemoveCoach(): boolean {
    return this.isGranted("REMOVE_COACH");
  }

  public canRemoveCheerleader(): boolean {
    return this.isGranted("REMOVE_CHEERLEADER");
  }
  public canRemoveApothecary(): boolean {
    return this.isGranted("REMOVE_APOTHECARY");
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
