import { TeamStatusValue } from "./Interfaces";

export default class TeamStatus {
    private status: TeamStatusValue = 'NEW';
    private displayNames: Map<TeamStatusValue, string>;

    constructor(rawApiStatus?: string) {
        rawApiStatus = rawApiStatus !== undefined ? rawApiStatus : 'New';
        const statusLookup = {
            'New': 'NEW', // Newly created, not yet submitted. Full edit capability
            'Active': 'ACTIVE', // Ready to Play. Shouldn't be able to do things that affect CTV or on-pitch effects. Should still allow reordering of the players and things like icons / genders of players.
            'Ready for Tournament': 'READY_FOR_TOURNAMENT', // Clone of Active (Ready to Play). The only current use is to prevent these teams from being accidentally enrolled into the Blackbox scheduler.
            'Waiting for Opponent': 'WAITING_FOR_OPPONENT', // Tournament state, there is a tournament match coming up. Should work much like Active
            'Skill Rolls Pending': 'SKILL_ROLLS_PENDING', // A state for teams where skill selection must be made. For 2016, this is just reaching the threshold. For 2020, it's reaching the stat SPP.
            'Post Match Sequence': 'POST_MATCH_SEQUENCE', // Post-match. Should allow buying new players (assuming treasury is available)
            'Re-Drafting': 'REDRAFTING', // Re-drafting state, editing as per redrafting rules.
            'Retired': 'RETIRED', // Retired team, no changes allowed (except for staff who can unretire, rename etc)
            'Pending Approval': 'PENDING_APPROVAL', // This is a state for teams that have been reported for violating the naming rules. Should be essentially locked until staff has reviewed (except for staff, who need access to the team)
            'Blocked': 'BLOCKED', // I don't remember fully what this does
        };

        this.displayNames = new Map<TeamStatusValue, string>([
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
        ]);

        this.statusName = rawApiStatus;
        this.status = statusLookup[rawApiStatus];
    }

    public getStatus() {
        return this.status;
    }

    public get displayName() {
      return this.displayNames.get(this.status);
    }

    public isNew(): boolean {
        return this.status === 'NEW';
    }

    public isActive(): boolean {
        return ['ACTIVE', 'WAITING_FOR_OPPONENT'].includes(this.status);
    }

    public isRetired(): boolean {
        return this.status === 'RETIRED';
    }

    public isPostMatch(): boolean {
        return this.status === 'POST_MATCH_SEQUENCE';
    }

    public isSkill(): boolean {
        return this.status === 'SKILL_ROLLS_PENDING';
    }

    public showPlayerControls(): boolean {
      return this.status === 'NEW'
      || this.status === 'POST_MATCH_SEQUENCE'
      || this.status === 'SKILL_ROLLS_PENDING'
      || this.status == 'REDRAFTING';
    }
}