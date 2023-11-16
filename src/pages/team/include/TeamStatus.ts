import { TeamStatusValue } from "./Interfaces";

export default class TeamStatus {
    private status: TeamStatusValue = 'NEW';

    constructor(rawApiStatus?: string) {
        rawApiStatus = rawApiStatus !== undefined ? rawApiStatus : 'New';
        const statusLookup = {
            'New': 'NEW', // Newly created, not yet submitted. Full edit capability
            'Active': 'ACTIVE', // Ready to Play. Shouldn't be able to do things that affect CTV or on-pitch effects. Should still allow reordering of the players and things like icons / genders of players.
            'Waiting for Opponent': 'WAITING_FOR_OPPONENT', // Tournament state, there is a tournament match coming up. Should work much like Active
            'Skill Rolls Pending': 'SKILL_ROLLS_PENDING', // A state for teams where skill selection must be made. For 2016, this is just reaching the threshold. For 2020, it's reaching the stat SPP.
            'Post Match Sequence': 'POST_MATCH_SEQUENCE', // Post-match. Should allow buying new players (assuming treasury is available)
            'Re-Drafting': 'REDRAFTING', // Re-drafting state, editing as per redrafting rules.
            'Retired': 'RETIRED', // Retired team, no changes allowed (except for staff who can unretire, rename etc)
            'Pending Approval': 'PENDING_APPROVAL', // This is a state for teams that have been reported for violating the naming rules. Should be essentially locked until staff has reviewed (except for staff, who need access to the team)
            'Blocked': 'BLOCKED', // I don't remember fully what this does 
        };

        this.status = statusLookup[rawApiStatus];
    }

    public getStatus() {
        return this.status;
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
}