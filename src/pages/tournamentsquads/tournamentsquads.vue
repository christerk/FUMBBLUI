<template>
    <div class="container" id="vuecontent">
        <PageHeader :navItems="navItems" defaultPage="squads" @setPage="setPage">
            <template #pagename>Tournament Squad Manager</template>
            <template #center>
                <div>Some other stuff</div>
            </template>
        </PageHeader>

        <div v-if="page == 'squads'">
            <template v-for="squad in squads" :key="squad.id">
                <TitledPanel id="squads">
                    <template #header>
                        <div class="groupname">{{ squad.name }}</div>
                        <div class="tournament">{{ squad.tournament }}</div>
                    </template>
                    <template #content>
                        <div class="squad">
                            <div class="members">
                                <div v-for="member in squad.members" :key="member.id" class="member">
                                    <div class="coach">
                                        <span class="captainMarker" v-if="member.coach == squad.captain"
                                            >&#9733; </span
                                        >{{ member.coach }}
                                    </div>
                                    <div class="teamname">{{ member.name }}</div>
                                    <div class="teamroster">{{ member.roster }}</div>
                                    <div class="teamlogo">
                                        <img :src="'https://fumbbl.com/i/' + member.logo" />
                                    </div>
                                </div>
                            </div>
                            <div class="squadfooter">
                                <div class="inviteWrap" v-if="coachName == squad.captain">
                                    <div class="settingsButton">
                                        <img src="https://fumbbl.com/i/718507" />
                                    </div>
                                    <div
                                        class="inviteInfo"
                                        v-if="squad.numInvited + squad.numRequested > 0"
                                    >
                                        <div class="invited" v-if="squad.numInvited > 0">
                                            Invites: {{ squad.numInvited }}
                                        </div>
                                        <div class="requested" v-if="squad.numRequested > 0">
                                            Requests: {{ squad.numRequested }}
                                        </div>
                                    </div>
                                </div>
                                <div v-if="coachName != squad.captain"></div>
                                <div class="memberWrap">
                                    Members:
                                    <div class="memberCount">
                                        <div class="accepted">{{ squad.numAccepted }}</div>
                                        &#x2571;
                                        <div class="cap">{{ squad.memberCap }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </TitledPanel>
            </template>
        </div>
    </div>
</template>

<style scoped>
@import './tournamentsquads.less';
</style>

<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'

import {PageHeader, TitledPanel} from '@components/fumbblcomponents'

@Component({
    components: {
        PageHeader,
        TitledPanel
    }
})
class TournamentSquads extends Vue {
    public apiBase: string = ''
    public coachName: string|null = null
    public page: string = 'squads'

    public navItems: any = [
        { label: 'Some Label', page: 'squads' },
        { label: 'Another page', page: 'something' }
    ]

    public squads: any = []

    public changed() {}

    public mounted() {
        if (window.location.host.indexOf('dev.') !== 0) {
            this.apiBase = 'https://' + window.location.host
        }

        this.coachName = document
            .getElementsByClassName('tournamentsquadspage')[0]
            .getAttribute('coach')

        if (window.location.hash) {
            const c = window.location.hash.substring(1)
            this.setPage(c)
        } else {
            this.setPage(this.page)
        }
    }

    public setPage(newPage: string) {
        this.page = newPage

        switch (newPage) {
            case 'squads':
                this.loadSquads()
                break
            default:
                break
        }
    }

    public loadSquads() {
        this.squads = [
            {
                id: 1234,
                tournament: 'Awesome Group Tournament',
                name: 'Best Squad',
                captain: 'Christer',
                members: [
                    {
                        id: 1,
                        coach: 'Christer',
                        teamId: 1234,
                        name: 'Skitter Skitter',
                        roster: 'Skaven',
                        logo: 486338
                    },
                    {
                        id: 2,
                        coach: 'Coach1',
                        teamId: 1235,
                        name: 'Orclin Rouge',
                        roster: 'Orc',
                        logo: 486332
                    },
                    {
                        id: 3,
                        coach: 'AnotherCoach',
                        teamId: 1236,
                        name: 'Sucky Vampires',
                        roster: 'Vampire',
                        logo: 486350
                    },
                    {
                        id: 4,
                        coach: 'ThirdCoach',
                        teamId: 1237,
                        name: 'Grubby Goblins',
                        roster: 'Goblin',
                        logo: 486272
                    }
                ],
                numAccepted: 4,
                numInvited: 2,
                numRequested: 1,
                memberCap: 6
            }
        ]
    }
}

export default toNative(TournamentSquads)
</script>
