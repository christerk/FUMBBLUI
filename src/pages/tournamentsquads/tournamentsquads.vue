<template>
    <div class="container" id="vuecontent">
        <PageHeader ref="pageHeader" :navItems="navItems" :defaultPage="defaultPage" @setPage="initPage">
            <template #pagename>Tournament Squads</template>
            <template #center>
                <div></div>
            </template>
        </PageHeader>

        <div v-if="page == 'createSquad'">
            <TitledPanel id="createSquad">
                <template #header>
                    <div class="groupname">Create Squad</div>
                </template>
                <template #content>

                    <div :class="{ createsquad: true, error: showErrors }">
                        <div class="wide">
                            <input ref="squadname" type="text" id="squadname" class="squadname" placeholder="Squad Name"
                                minlength="1" required />
                            <div class="requirements">Must provide a squad name</div>
                        </div>
                        <div class="narrow">
                            <input v-model="memberCount" type="number" min="1" max="16" id="membercount"
                                class="membercount" placeholder="Member count (1-16)" required />
                            <div class="requirements">Must have 1-16 members</div>
                        </div>
                        <div class="narrow">
                            <input v-model="reserveCount" type="number" min="0" max="16" id="reservecount"
                                class="membercount" placeholder="Reserve count (0-16)" />
                            <div class="requirements">Must have 0-16 reserves</div>
                        </div>
                    </div>
                    <div class="controls tcenter">
                        <button class="CreateButton" @click="createSquad">Create Squad</button>
                    </div>
                </template>
            </TitledPanel>
        </div>
        <div v-if="page == 'squads'">
            <template v-if="squads.length === 0">
                <div class="no-squads-message tcenter">
                    <p class="title">No squads found.</p>
                    <p>
                        Use the tabs above to create or join a tournament squad.
                    </p>
                </div>
            </template>
            <template v-else v-for="squad in squads" :key="squad.id">
                <TitledPanel id="squads">
                    <template #header>
                        <div class="groupname">{{ squad.name }}</div>
                        <div class="tournament" v-if="squad.tournament != null">{{ squad.tournament.name }}</div>
                    </template>
                    <template #content>
                        <div :class="{ squad: true, allowEdit: isCoachCaptain(squad, coachName) }">
                            <div class="sectionheader">Team Members</div>
                            <div class="members" @dragover.prevent @drop.prevent="onDropMember($event, squad, false)">
                                <div v-for="member in squad.members" :key="member.id" :teamid="member.teamId"
                                    class="member" draggable="true"
                                    @click.prevent="openRemoveMemberModal(member, squad)"
                                    @dragstart="onDragStart($event, member, squad, false)">
                                    <div class="coach">
                                        <span class="captainMarker" v-if="isCoachCaptain(squad, member.coach)">&#9733;
                                        </span><a href="#">{{ member.coach }}</a>
                                    </div>
                                    <div class="teamname">{{ member.name }}</div>
                                    <div class="teamlogo">
                                        <img :src="'https://fumbbl.com/i/' + member.logo" :alt="member.roster"
                                            :title="member.roster" />
                                    </div>
                                </div>
                                <template v-if="squad.limits.maxMembers - squad.members.length > 0">
                                    <div class="member empty" @dragover.prevent
                                        @drop.prevent="onDropEmpty($event, squad, false)">
                                        {{ openSpotString(squad.limits.maxMembers - squad.members.length) }}
                                    </div>
                                </template>
                            </div>
                            <div v-if="squad.limits.maxReserves > 0">
                                <div class="sectionheader">Reserves</div>
                                <div class="reserves" @dragover.prevent
                                    @drop.prevent="onDropMember($event, squad, true)">
                                    <div v-for="member in squad.reserves" :key="member.id" :teamid="member.teamId"
                                        class="member" draggable="true"
                                        @click.prevent="openRemoveMemberModal(member, squad)"
                                        @dragstart="onDragStart($event, member, squad, true)">
                                        <div class="coach">
                                            <span class="captainMarker"
                                                v-if="isCoachCaptain(squad, member.coach)">&#9733;
                                            </span><a href="#">{{ member.coach }}</a>
                                        </div>
                                        <div class="teamname">{{ member.name }}</div>
                                        <div class="teamlogo">
                                            <img :src="'https://fumbbl.com/i/' + member.logo" :alt="member.roster"
                                                :title="member.roster" />
                                        </div>
                                    </div>
                                    <template v-if="squad.limits.maxReserves - squad.reserves.length > 0">
                                        <div class="member empty" @dragover.prevent
                                            @drop.prevent="onDropEmpty($event, squad, true)">
                                            {{ openSpotString(squad.limits.maxReserves - squad.reserves.length) }}
                                        </div>
                                    </template>
                                </div>
                            </div>
                            <div class="squadfooter">
                                <div class="inviteWrap">
                                    <div class="settingsButton" @click="toggleSettings(squad)">
                                        <img src="https://fumbbl.com/i/718507" />
                                    </div>
                                    <div class="inviteInfo"
                                        v-if="isCoachCaptain(squad, coachName) && squad.requests.length > 0">
                                        Requests: {{ squad.requests.length }}
                                    </div>
                                </div>
                                <div class="memberWrap">
                                    <span>
                                        Members:
                                        <div class="memberCount">
                                            <div class="accepted">{{ squad.members.length }}</div>
                                            &#x2571;
                                            <div class="cap">{{ squad.limits.maxMembers }}</div>
                                        </div>
                                    </span>
                                    <span v-if="squad.limits.maxReserves > 0">
                                        Reserves:
                                        <div class="memberCount">
                                            <div class="accepted">{{ squad.reserves.length }}</div>
                                            &#x2571;
                                            <div class="cap">{{ squad.limits.maxReserves }}</div>
                                        </div>
                                    </span>
                                </div>
                                <div v-if="squad.settingsVisible" class="squadsettings">
                                    <div class="pendingRequestsList">
                                        <div v-for="request in squad.requests" :key="request.team.id"
                                            class="squad-request">
                                            <div class="request-coach">{{ request.team.name }}</div>
                                            <div class="request-team">({{ request.coach.name }})</div>
                                            <div class="request-controls">
                                                <button class="accept-btn" @click="acceptRequestMember(request, squad)"
                                                    :disabled="squad.members.length >= squad.limits.maxMembers">Accept
                                                    as member</button>
                                                <button class="accept-btn" @click="acceptRequestReserve(request, squad)"
                                                    :disabled="squad.reserves.length >= squad.limits.maxReserves">Accept
                                                    as reserve</button>
                                                <button @click="declineRequest(request, squad)"
                                                    class="decline-btn">Decline</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="controls">
                                        <button class="DisbandButton" v-if="isCoachCaptain(squad, coachName)"
                                            @click="disbandSquad(squad)">Disband
                                            Squad</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </TitledPanel>
            </template>
        </div>
        <div v-if="page == 'requests'">
            <TitledPanel id="pendingRequests">
                <template #header>
                    <div class="groupname">Join a Squad</div>
                </template>
                <template #content>
                    <div class="search">
                        <div class="search-form">
                            <input class="rounded-input" v-model="searchQuery" type="text" placeholder="Search"
                                @keyup.enter="searchSquads" @keyup.escape="clearSearch" />
                            <button @click="searchSquads">Search</button>
                        </div>
                        <div class="search-backdrop" v-if="searchPerformed">
                            <div class="search-results" v-if="searchResults.length === 0">
                                <div class="search-result">No squads found.</div>
                            </div>
                            <div class="search-results" v-else-if="searchResults.length > 0">
                                <div v-for="squad in searchResults" :key="squad.id" class="search-result"
                                    @click="requestToJoin(squad)">
                                    <span class="captain"> (Captain: {{ squad.captain }})</span>
                                    <span>{{ squad.name }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="section" v-if="pendingRequests.length > 0">
                            <div class="sectionheader">Pending Requests</div>
                            <div class="pendingrequests">
                                <div v-for="request in pendingRequests" :key="request.id" class="pending-request">
                                    <div>{{ request.squad.name }} <span class="captain">(Captain: {{
                                        request.squad.captain }})</span></div>
                                    <div class="team">{{ request.team.name }}</div>
                                    <a href="#" @click.prevent="cancelRequest(request)">Cancel</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </TitledPanel>
        </div>


    </div>

    <ConfirmModal ref="confirmModal" :button-settings="{
        cancel: { enabled: true, label: 'Close' },
        confirm: { enabled: true, label: 'Disband' },
    }" />

    <Modal ref="joinModal" :button-settings="{
        cancel: { enabled: true, label: 'Cancel' },
        confirm: { enabled: true, label: 'Send Request' },
    }" @confirm="sendJoinRequest" @cancel="cancelJoinRequest">
        <template #header>
            <div class="groupname">Join Squad</div>
        </template>
        <template #body>
            <div class="joinSquadModal">
                <div>Select a team to join <b>{{ joinModalSquad?.name }}</b>:</div>
                <div v-if="userTeams.length === 0">No teams available.</div>
                <div v-else>
                    <select v-model="selectedJoinTeam">
                        <option v-for="team in userTeams" :key="team.id" :value="team">{{ team.name }}</option>
                    </select>
                </div>
            </div>
        </template>
    </Modal>

    <Modal ref="removeMemberModal" :button-settings="{
        cancel: { enabled: true, label: 'Cancel' },
        confirm: { enabled: true, label: 'Remove' },
    }" @confirm="confirmRemoveMember" @cancel="cancelRemoveMember">
        <template #header>
            <div class="groupname">Remove Member</div>
        </template>
        <template #body>
            <div class="removeMemberModal">
                <div v-if="removeMemberTarget">
                    Are you sure you want to remove
                    <b>{{ removeMemberTarget.member.name }}</b>
                    from squad <b>{{ removeMemberTarget.squad.name }}</b>?
                </div>
            </div>
        </template>
    </Modal>
</template>

<style scoped>
@import "./tournamentsquads.less";
</style>

<script lang="ts">
import { Component, Vue, toNative, Ref, Watch } from "vue-facing-decorator";

import { PageHeader, TitledPanel, Modal, ConfirmModal } from "@components/fumbblcomponents";
import FumbblApi from "@api/fumbbl";

@Component({
    components: {
        PageHeader,
        TitledPanel,
        ConfirmModal,
        Modal,
    },
})
class TournamentSquads extends Vue {
    public apiBase: string = "";
    public coachName: string | null = null;
    public defaultPage: string = "squads";
    public page: string = "squads";
    private fumbbl: FumbblApi = new FumbblApi();

    public showErrors: boolean = false;

    @Ref
    pageHeader!: InstanceType<typeof PageHeader>;

    @Ref
    squadname!: any;

    public memberCount: number | null = null;
    public reserveCount: number | null = null;

    @Ref confirmModal!: InstanceType<typeof ConfirmModal>;
    @Ref joinModal!: InstanceType<typeof Modal>;
    @Ref removeMemberModal!: InstanceType<typeof Modal>;

    public navItems: any = [
        { label: "Create Squad", page: "createSquad" },
        { label: "My Squads", page: "squads" },
        { label: "Join a Squad", page: "requests" },
    ];

    public squads: any = [];
    // New state for requests/search
    public pendingRequests: any[] = [];
    public searchPerformed: boolean = false;
    public searchQuery: string = "";
    public searchResults: any[] = [];
    private searchDebounceTimer: any = null;
    // Modal state for join request
    public joinModalSquad: any = null;
    public userTeams: any[] = [];
    public selectedJoinTeam: any = null;
    public removeMemberTarget: { member: any, squad: any } | null = null;


    public created() {
        if (window.location.hash) {
            const c = window.location.hash.substring(1);
            this.defaultPage = c;
        }
    }

    public changed() { }

    public mounted() {
        if (window.location.host.indexOf("dev.") !== 0) {
            this.apiBase = "https://" + window.location.host;
        }

        this.coachName = document
            .getElementsByClassName("tournamentsquadspage")[0]
            .getAttribute("coach");

        document.addEventListener("click", (event) => {
            if (!this.$refs.joinModal || !this.$refs.joinModal.isVisible) {
                this.clearSearch();
            }
        });
    }

    public setPage(newPage: string) {
        if (this.pageHeader) {
            this.pageHeader.setPage(newPage);
        }
    }

    public initPage(newPage: string) {
        this.page = newPage;

        switch (newPage) {
            case "squads":
                this.loadSquads();
                break;
            case "createSquad":
                this.memberCount = null;
                this.reserveCount = null;
                this.showErrors = false;
                this.$nextTick(() => {
                    this.squadname.focus();
                });
                break;
            case "requests":
                this.loadTeams();
                this.clearSearch();
                this.loadRequests();
                break;

            default:
                break;
        }
    }

    public async createSquad() {
        if (document.querySelector(":invalid") != null) {
            this.showErrors = true;
            return;
        }

        let createdSquad = await this.fumbbl.TournamentSquads.create({
            name: this.squadname.value,
            maxMembers: this.memberCount,
            maxReserves: this.reserveCount,
        });

        this.squads.push({
            id: createdSquad.id,
            limits: {
                maxMembers: createdSquad.maxMembers,
                maxReserves: createdSquad.maxReserves,
            },
            tournament: null,
            name: createdSquad.name,
            captain: this.coachName,
            members: [],
            reserves: [],
            requests: [],
        });

        this.pageHeader.setPage("squads");
    }

    public disbandSquad(squad: any) {
        this.$refs.confirmModal.show({
            title: "Disband Squad?",
            text: `Are you sure you want to disband the squad "${squad.name}"?`,
            confirm: () => {
                this.fumbbl.TournamentSquads.disband(squad.id);
                this.squads = this.squads.filter((s: any) => s.id !== squad.id);
                this.loadSquads();
            }
        });
    }

    public toggleSettings(squad: any) {
        squad.settingsVisible = !squad.settingsVisible;
    }

    public async loadTeams() {
        this.userTeams = (await this.fumbbl.Coach.activeTeams(this.coachName || "")).teams;
    }

    public async loadSquads() {
        this.squads = await this.fumbbl.TournamentSquads.list();
    }

    public async loadRequests() {
        this.pendingRequests = await this.fumbbl.TournamentSquads.getPendingRequests();
    }

    public isCoachCaptain(squad: any, coachName: string): boolean {
        return squad.captain === coachName;
    }

    public openSpotString(num: number): string {
        if (num === 1) {
            return "1 open spot";
        } else {
            return `${num} open spots`;
        }
    }

    // New methods for requests/search
    public cancelRequest(request: any) {
        this.fumbbl.TournamentSquads.cancelRequest(request.squad.id, request.team.id);
        this.pendingRequests = this.pendingRequests.filter(r => r.squad.id !== request.squad.id || r.team.id !== request.team.id);
    }

    public async searchSquads() {
        this.searchResults = await this.fumbbl.TournamentSquads.search(this.searchQuery.trim());
        this.searchPerformed = true;
    }


    public clearSearch() {
        this.searchQuery = "";
        this.searchResults = [];
        this.searchPerformed = false;
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }
    }

    @Watch("searchQuery")
    onSearchQueryChanged() {
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }
        if (!this.searchQuery.trim()) {
            this.searchResults = [];
            this.searchPerformed = false;
            return;
        }
        this.searchDebounceTimer = setTimeout(() => {
            this.searchSquads();
        }, 350);
    }

    public requestToJoin(squad: any) {
        this.joinModalSquad = squad;
        this.selectedJoinTeam = this.userTeams.length > 0 ? this.userTeams[0] : null;
        this.$refs.joinModal.show();
    }

    public sendJoinRequest() {
        if (!this.selectedJoinTeam || !this.joinModalSquad) return;

        this.fumbbl.TournamentSquads.sendJoinRequest(this.joinModalSquad.id, this.selectedJoinTeam.id);

        if (this.$refs.joinModal) {
            this.$refs.joinModal.hide();
        }
        this.searchQuery = "";
        this.clearSearch();
        this.loadRequests();
    }

    public cancelJoinRequest() {
        if (this.$refs.joinModal) {
            this.$refs.joinModal.hide();
        }
        this.joinModalSquad = null;
        this.selectedJoinTeam = null;
        this.searchPerformed = true;
    }

    public getSquadCaptain(squadName: string): string {
        const squad = this.squads.find((s: any) => s.name === squadName);
        return squad ? squad.captain : "Unknown";
    }

    public async acceptRequestMember(request: any, squad: any) {
        await this.fumbbl.TournamentSquads.acceptRequestMember(squad.id, request.team.id);
        // Move request.team to members, remove from requests
        squad.members.push({
            id: request.team.id,
            coach: request.coach.name,
            teamId: request.team.id,
            name: request.team.name,
            roster: "", // Add roster if available
            logo: request.team.logo,
        });
        squad.requests = squad.requests.filter((r: any) => r !== request);
    }

    public async acceptRequestReserve(request: any, squad: any) {
        await this.fumbbl.TournamentSquads.acceptRequestReserve(squad.id, request.team.id);
        // Move request.team to reserves, remove from requests
        squad.reserves.push({
            id: request.team.id,
            coach: request.coach.name,
            teamId: request.team.id,
            name: request.team.name,
            roster: "", // Add roster if available
            logo: request.team.logo,
        });
        squad.requests = squad.requests.filter((r: any) => r !== request);
    }

    public async declineRequest(request: any, squad: any) {
        await this.fumbbl.TournamentSquads.declineRequest(squad.id, request.team.id);
        squad.requests = squad.requests.filter((r: any) => r !== request);
    }
    // Drag and drop logic for swapping members/reserves
    private dragData: any = null;

    public onDragStart(event: DragEvent, member: any, squad: any, isReserve: boolean) {
        this.dragData = {
            member,
            squad,
            isReserve
        };
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", JSON.stringify({
                teamId: member.id,
                squadId: squad.id,
                isReserve
            }));
        }
    }

    public async onDropMember(event: DragEvent, squad: any, targetIsReserve: boolean) {
        if (!this.dragData || this.dragData.squad.id !== squad.id) return;
        const fromIsReserve = this.dragData.isReserve;
        if (fromIsReserve === targetIsReserve) return; // Only allow cross-category

        // If dropped on a member, swap with that member
        const targetElem = (event.target as HTMLElement).closest('.member:not(.empty)');
        if (targetElem) {
            const targetId = targetElem.getAttribute('teamid') || targetElem.getAttribute('data-key');
            let targetMember = null;
            if (targetIsReserve) {
                targetMember = squad.reserves.find((m: any) => m.teamId == targetId);
            } else {
                targetMember = squad.members.find((m: any) => m.teamId == targetId);
            }
            if (targetMember) {
                await this.swapTeam(squad.id, this.dragData.member.teamId, targetMember.teamId);
                this.dragData = null;
                await this.loadSquads();
                return;
            }
        }
    }

    public async onDropEmpty(event: DragEvent, squad: any, targetIsReserve: boolean) {
        if (!this.dragData || this.dragData.squad.id !== squad.id) return;
        const fromIsReserve = this.dragData.isReserve;
        if (fromIsReserve === targetIsReserve) return; // Only allow cross-category

        // Move to other category (no swap)
        await this.swapTeam(squad.id, this.dragData.member.teamId, null);
        this.dragData = null;
        await this.loadSquads();
    }

    // Call swapTeam API
    public async swapTeam(squadId: number, teamId: number, otherTeamId: number | null) {
        await this.fumbbl.TournamentSquads.swapTeam(squadId, teamId, otherTeamId);
    }
    public async openRemoveMemberModal(member: any, squad: any) {
        this.removeMemberTarget = { member, squad };
        (this.$refs.removeMemberModal as any).show();
    }

    public async confirmRemoveMember() {
        if (!this.removeMemberTarget) return;
        const { member, squad } = this.removeMemberTarget;
        await this.fumbbl.TournamentSquads.removeMember(squad.id, member.teamId);
        squad.members = squad.members.filter((m: any) => m.teamId !== member.teamId);
        this.removeMemberTarget = null;
        (this.$refs.removeMemberModal as any).hide();
    }

    public cancelRemoveMember() {
        this.removeMemberTarget = null;
        (this.$refs.removeMemberModal as any).hide();
    }
}
export default toNative(TournamentSquads);
</script>
