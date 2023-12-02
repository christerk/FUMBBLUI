import { ActionGrantAccessTo, TeamAction, TeamStatusValue, UserRole } from "./Interfaces";

export default class AccessControl {
    private accessRules: ActionGrantAccessTo[] = [];
    private userRoles: UserRole[] = [];
    private teamStatus: TeamStatusValue = 'RETIRED';

    constructor(userRoles: UserRole[], teamStatus: TeamStatusValue) {
        this.userRoles = userRoles;
        this.teamStatus = teamStatus;

        this.accessRules.push(
            {
                action: 'CREATE',
                grantAccessToList: [
                    {
                        userRoles: ['OWNER'],
                        teamStatusValues: ['NEW'],
                    }
                ]
            },
            {
                action: 'HIRE_ROOKIE',
                grantAccessToList: [
                    {
                        userRoles: ['OWNER'],
                        teamStatusValues: ['NEW', 'POST_MATCH_SEQUENCE', 'SKILL_ROLLS_PENDING'],
                    }
                ]
            },
            {
                action: 'EDIT',
                grantAccessToList: [
                    {
                        userRoles: ['OWNER', 'LEAGUE_STAFF', 'SITE_STAFF'],
                        teamStatusValues: ['NEW', 'POST_MATCH_SEQUENCE', 'SKILL_ROLLS_PENDING'],
                    }
                ]
            },
            {
                action: 'READY_TEAM',
                grantAccessToList: [
                    {
                        userRoles: ['OWNER'],
                        teamStatusValues: ['POST_MATCH_SEQUENCE'],
                    }
                ]
            },
            {
                action: 'RETIRE_TEAM',
                grantAccessToList: [
                    {
                        userRoles: ['OWNER', 'LEAGUE_STAFF', 'SITE_STAFF'],
                        teamStatusValues: ['ACTIVE'],
                    }
                ]
            },
            {
                action: 'VIEW_HISTORY',
                grantAccessToList: [
                    {
                        userRoles: ['OWNER', 'LEAGUE_STAFF', 'SITE_STAFF'],
                        teamStatusValues: ['ACTIVE', 'POST_MATCH_SEQUENCE', 'SKILL_ROLLS_PENDING'],
                    }
                ]
            },
        );
    }

    private isGranted(teamAction: TeamAction): boolean {
        for (const actionGrantAccessTo of this.accessRules) {
            if (teamAction !== actionGrantAccessTo.action) {
                continue;
            }

            for (const grantAccessTo of actionGrantAccessTo.grantAccessToList) {
                if (! grantAccessTo.teamStatusValues.includes(this.teamStatus)) {
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
        return this.isGrantedAny(['CREATE', 'EDIT']);
    }

    public canRetireTeam(): boolean {
        return this.isGrantedAny(['RETIRE_TEAM']);
    }

    public canReadyTeam(): boolean {
        return this.isGrantedAny(['READY_TEAM']);
    }

    public canCreate(): boolean {
        return this.isGranted('CREATE');
    }

    public canViewHistory(): boolean {
        return this.isGranted('VIEW_HISTORY');
    }

    public canHireRookie(): boolean {
        return this.isGranted('HIRE_ROOKIE');
    }
}