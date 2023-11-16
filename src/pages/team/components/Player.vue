<template>
    <div class="playerrow"
        :draggable="teamSheetEntry.getIsDragSource() && ! teamSheetEntry.getIsJourneyman()"
        :class="{
            playerinrow: teamSheetEntry.hasPlayer(),
            dragsource: teamSheetEntry.getIsDragSource(),
            droptarget: teamSheetEntry.getIsDropTarget(),
        }"
        @dragenter="! teamSheetEntry.getIsJourneyman() ? triggerDragEnter() : undefined"
        @dragover="! teamSheetEntry.getIsJourneyman() ? handleDragOver($event) : undefined"
        @drop="! teamSheetEntry.getIsJourneyman() ? handleDrop($event) : undefined"
        @dragend="! teamSheetEntry.getIsJourneyman() ? triggerDragEnd() : undefined"
    >
        <template v-if="teamSheetEntry.isFirst() && teamSheetEntry.hasPlayer() && !teamSheetEntry.getIsDragSource() && teamSheetEntry.getIsDropTarget()">
            <div class="seperator active"><div class="line"></div></div>
        </template>
        <template v-else>
            <div class="seperator spacer"><div class="line"></div></div>
        </template>
        <div class="main" :class="{missnextgame: teamSheetEntry.hasPlayer() && teamSheetEntry.getPlayer().isMissNextGame()}">
            <template v-if="teamSheetEntry.hasRosteredPlayer()">
                <div v-if="allFoldOutsClosed" class="cell draghandle" @mousedown="triggerMakePlayerDraggable()" @mouseup="triggerEndPlayerDraggable()">
                    <template v-if="!isAnyPlayerDragInProgress || teamSheetEntry.getIsDragSource()">
                        <svg fill="#000000" version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            width="15px" height="25px" viewBox="0 0 32 32" xml:space="preserve">
                            <title>draggable</title>
                            <rect x="10" y="6" width="4" height="4"/>
                            <rect x="18" y="6" width="4" height="4"/>
                            <rect x="10" y="14" width="4" height="4"/>
                            <rect x="18" y="14" width="4" height="4"/>
                            <rect x="10" y="22" width="4" height="4"/>
                            <rect x="18" y="22" width="4" height="4"/>
                            <rect id="_Transparent_Rectangle_" width="15" height="25" style="fill:none;"/>
                        </svg>
                    </template>
                    <template v-else>
                        <div class="droptargetindicator">&#8982;</div>
                    </template>
                </div>
                <div v-else class="cell draghandledisabled">
                </div>
            </template>
            <template v-else>
                <div class="cell draghandle">
                    <div class="droptargetindicator">&#8982;</div>
                </div>
            </template>
            <div class="cell playernumber">
                <span class="normalplayernumber">
                    {{ teamSheetEntry.getNumber() }}
                </span>
                <div class="draggingnowindicator">&#8597;</div>
            </div>
            <template v-if="teamSheetEntry.getIsUpdating()">
                <div class="isupdating">
                    <span class="loadingellipsis">Updating</span>
                </div>
            </template>
            <template v-else-if="teamSheetEntry.hasPlayer()">
                <div class="cell playericoncontainer">
                    <div class="iconusingbackground" :style="rosterIconManager.getIconStyle(teamSheetEntry.getPlayer().getPositionId(), teamSheetEntry.getPlayer().getIconRowVersionPosition())"></div>
                </div>
                <div class="cell playerdetails">
                    <div class="playername" :title="teamSheetEntry.getPlayer().getPlayerName()">
                        <span v-if="teamSheetEntry.getPlayer().isTemporaryPlayerWithoutName()">Loading...</span>
                        <span v-else-if="teamSheetEntry.getPlayer().isTemporaryPlayer() || teamSheetEntry.getIsJourneyman()">{{ teamSheetEntry.getPlayer().getPlayerName() }}</span>
                        <a v-else href="#" @click.exact.prevent="toggleFoldOutMore(false)" @click.ctrl.prevent="toggleFoldOutMore(true)" :title="`Player: ${teamSheetEntry.getPlayer().getPlayerName()}, ID: ${teamSheetEntry.getPlayer().getId()}`">{{ teamSheetEntry.getPlayer().getPlayerName() }}</a>
                    </div>
                    <div class="playerposition" :title="teamSheetEntry.getPlayer().getDisplayPositionName()">{{ teamSheetEntry.getPlayer().getDisplayPositionName() }}</div>
                </div>
                <template v-if="! compactView">
                    <div class="cell statma">
                        <span :class="{
                            statincrease: teamSheetEntry.getPlayer().hasMovementIncrease,
                            statdecrease: teamSheetEntry.getPlayer().hasMovementDecrease,
                            }">{{ teamSheetEntry.getPlayer().movementStat }}</span>
                    </div>
                    <div class="cell statst">
                        <span :class="{
                            statincrease: teamSheetEntry.getPlayer().hasStrengthIncrease,
                            statdecrease: teamSheetEntry.getPlayer().hasStrengthDecrease,
                            }">{{ teamSheetEntry.getPlayer().strengthStat }}</span>
                    </div>
                    <div class="cell statag">
                        <span :class="{
                            statincrease: teamSheetEntry.getPlayer().hasAgilityIncrease,
                            statdecrease: teamSheetEntry.getPlayer().hasAgilityDecrease,
                            }">{{ teamSheetEntry.getPlayer().agilityStat }}+</span>
                    </div>
                    <div class="cell statpa">
                        <span v-if="teamSheetEntry.getPlayer().getPositionStats().Passing" :class="{
                            statincrease: teamSheetEntry.getPlayer().hasPassingIncrease,
                            statdecrease: teamSheetEntry.getPlayer().hasPassingDecrease,
                            }">{{ teamSheetEntry.getPlayer().passingStat }}+</span>
                        <span v-else>-</span>
                    </div>
                    <div class="cell statav">
                        <span :class="{
                            statincrease: teamSheetEntry.getPlayer().hasArmourIncrease,
                            statdecrease: teamSheetEntry.getPlayer().hasArmourDecrease,
                            }">{{ teamSheetEntry.getPlayer().armourStat }}+</span>
                    </div>
                </template>
                <div class="cell skills">
                    <div class="positionskills" :title="teamSheetEntry.getPlayer().getPositionSkills().join(', ')">
                        {{ teamSheetEntry.getPlayer().getPositionSkills().join(', ') }}
                    </div>
                    <div class="playerskills" :title="teamSheetEntry.getPlayer().getSkills().join(', ')">
                        {{ teamSheetEntry.getPlayer().getSkills().join(', ') }}
                        <template v-if="teamSheetEntry.getIsJourneyman()">Loner</template>
                    </div>
                </div>
                <div class="cell injuries" :title="'Injuries in chronological order: ' + teamSheetEntry.getPlayer().getInjuries().join(',')">
                    {{ displayInjuries(teamSheetEntry.getPlayer().getInjuries()) }}
                </div>
                <div class="cell spp" :title="sppSummaryText">
                    <template v-if="teamSheetEntry.getPlayer().getPosition().isPeaked">
                        <div>Peak-{{ sppDisplayInfo.spendable }}</div>
                    </template>
                    <template v-else>
                        <span class="spendable">{{ sppDisplayInfo.spendable }}/</span><span class="maxlimit">{{ sppDisplayInfo.maxLimit }}</span>
                        <div class="tierinfo"><span v-for="n in sppDisplayInfo.tier" :key="n">•</span></div>
                    </template>
                </div>
                <div class="cell cost">
                    <div class="costbasic">{{ teamSheetEntry.getPlayer().getPlayerCost()/1000 }}k</div>
                    <div class="costbreakdown">({{ teamSheetEntry.getPlayer().getPositionCost()/1000 }}+{{ teamSheetEntry.getPlayer().getSkillCost()/1000 }})k</div>
                </div>
                <div v-if="accessControl.canCreate()" class="cell removenewplayer">
                    <template v-if="! teamSheetEntry.getIsJourneyman()">
                        (<a href="#" @click.prevent="triggerRemovePlayer">Remove</a>)
                    </template>
                </div>
                <div v-else-if="accessControl.canEdit()" class="cell retireplayer">
                    <template v-if="! teamSheetEntry.getIsJourneyman()">
                        (<a href="#" @click.prevent="triggerNominateRetirePlayer">{{ teamSheetEntry.getPlayer().getIsRefundable() ? 'Refund' : 'Retire' }}</a>)
                    </template>
                    <template v-else>
                        (<a href="#" @click.prevent="triggerHireJourneyman">Hire</a>)
                    </template>
                </div>
            </template>
            <template v-else>
                <div class="emptyplayer">
                    <span>Empty</span>
                </div>
            </template>
        </div>
        <div class="foldout foldoutmore" :class="{active: isFoldOutMore}">
            <playerdetails v-if="teamSheetEntry.hasRosteredPlayer()"
                :fumbbl-api="fumbblApi"
                :team-sheet-entry="teamSheetEntry"
                :can-edit="accessControl.canEdit()"
                :name-generator="nameGenerator"
                @close="performFoldOut('CLOSED')"
            ></playerdetails>
        </div>
        <div class="seperator" :class="getSeperatorClasses()"><div class="line"></div></div>
    </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import { Prop, Component, Vue, toNative, Emit } from 'vue-facing-decorator'
import { PlayerRowFoldOutMode } from "../include/Interfaces";
import PlayerDetailsComponent from "./PlayerDetails.vue";
import FumbblApi from "../include/FumbblApi";
import TeamSheetEntry from "../include/TeamSheetEntry";
import AccessControl from "../include/AccessControl";
import RosterIconManager from "../include/RosterIconManager";
import { EventDataFoldOut, EventDataRemovePlayer, EventDataDrop } from "../include/EventDataInterfaces";
import Player from "../include/Player";

@Component({
    components: {
        'playerdetails': PlayerDetailsComponent,
    },
})
class PlayerComponent extends Vue {
    @Prop({
        type: Object as PropType<FumbblApi>,
        required: true,
    })
    public fumbblApi!: FumbblApi;

    @Prop({
        type: Object as PropType<TeamSheetEntry>,
        required: true,
    })
    public teamSheetEntry!: TeamSheetEntry;

    @Prop({
        type: Object as PropType<AccessControl>,
        required: true,
    })
    public accessControl!: AccessControl;

    @Prop({
        type: Boolean,
        required: true,
    })
    public allFoldOutsClosed!: boolean;

    @Prop({
        type: Boolean,
        required: true,
    })
    public isAnyPlayerDragInProgress!: boolean;

    @Prop({
        type: Boolean,
        required: true,
    })
    public useActiveSeperatorForDragDrop!: boolean;

    @Prop({
        type: Object as PropType<RosterIconManager>,
        required: true,
    })
    public rosterIconManager!: RosterIconManager;

    @Prop({
        type: String,
        required: true,
    })
    public nameGenerator!: string;

    @Prop({
        type: Boolean,
        required: true,
    })
    public compactView!: boolean;

    @Emit('make-player-draggable')
    public triggerMakePlayerDraggable(): number {
        return this.teamSheetEntry.getNumber();
    }

    @Emit('end-player-draggable')
    public triggerEndPlayerDraggable() {}

    @Emit('drag-enter')
    public triggerDragEnter(): number {
        return this.teamSheetEntry.getNumber();
    }

    @Emit('drop')
    public triggerDrop(): EventDataDrop {
        return {
            teamSheetEntryNumber: this.teamSheetEntry.getNumber(),
            hasPlayer: this.teamSheetEntry.hasPlayer(),
        };
    }

    @Emit('drag-end')
    public triggerDragEnd() {}

    @Emit('remove-player')
    public triggerRemovePlayer(): EventDataRemovePlayer {
        const player = this.teamSheetEntry.getPlayer();
        return {
            teamSheetEntryNumber: this.teamSheetEntry.getNumber(),
            playerId: player ? player.getId() : 0,
        };
    }

    @Emit('nominate-retire-player')
    public triggerNominateRetirePlayer(): Player {
        return this.teamSheetEntry.getPlayer()!;
    }

    @Emit('hire-journeyman')
    public triggerHireJourneyman(): Player {
        return this.teamSheetEntry.getPlayer()!;
    }

    readonly delayForFoldoutAnimations = 600;
    private intervalIdsScrollDuringCssTransition: number[] = [];

    private mounted() {
        this.$el.getElementsByClassName('foldout')[0].addEventListener('transitionend', () => {
            this.clearIntervalIdsScrollDuringCssTransition();
        });
    }

    private created() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    private destroyed() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            if (this.isFoldOutMore) {
                event.preventDefault();
                this.performFoldOut('CLOSED', true);
            }
        }
    }

    public get isFoldOutMore(): boolean {
        return this.teamSheetEntry.getFoldOut() === 'MORE';
    }

    public getSeperatorClasses() {
        if (this.useActiveSeperatorForDragDrop) {
            return { active: true };
        }

        return {
            normal: true,
        };
    }

    public performFoldOut(playerRowFoldOutMode: PlayerRowFoldOutMode, multipleOpenMode = false) {
        this.triggerFoldOut({
            teamSheetEntryNumber: this.teamSheetEntry.getNumber(),
            playerRowFoldOutMode,
            multipleOpenMode
        });
        this.enableSmartScroll();
        if (playerRowFoldOutMode === 'CLOSED') {
            this.teamSheetEntry.refreshUpdatePlayerDetails();
        }
    }

    @Emit('fold-out')
    public triggerFoldOut(eventDataFoldOut: EventDataFoldOut): EventDataFoldOut {
        return eventDataFoldOut;
    }

    private enableSmartScroll() {
        this.clearIntervalIdsScrollDuringCssTransition();
        const onlyRunUntil = Date.now() + 1000;
        const intervalId = setInterval(() => {
            // prevent running indefinitely on a cancelled transition
            if (Date.now() > onlyRunUntil) {
                this.clearIntervalIdsScrollDuringCssTransition();
                return;
            }

            // when bottom of player row extends past end of screen
            if (this.$el.getBoundingClientRect().bottom > window.innerHeight) {
                this.$el.scrollIntoView({behavior: 'smooth', block: 'end'});
            }

            // when top of player row extends above start of screen
            if (this.$el.getBoundingClientRect().top < 0) {
                this.$el.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        });
        this.intervalIdsScrollDuringCssTransition.push(intervalId);
    }

    private clearIntervalIdsScrollDuringCssTransition() {
        for (const intervalId of this.intervalIdsScrollDuringCssTransition) {
            clearInterval(intervalId);
        }
        this.intervalIdsScrollDuringCssTransition = [];
    }

    public toggleFoldOutMore(multipleOpenMode: boolean) {
        if (this.isFoldOutMore) {
            this.performFoldOut('CLOSED', multipleOpenMode);
        } else {
            this.performFoldOut('MORE', multipleOpenMode);
        }
    }

    public handleDragOver(event: any) {
        event.preventDefault();
        return false;
    }

    public handleDrop(event: any) {
        this.triggerDrop();
        event.stopPropagation();
        return false;
    }

    public displayInjuries(injuries: string[]): string {
        let niggleCount = 0;
        const displayInjuries: string[] = [];

        for (const injury of injuries) {
            if (injury === 'n') {
                niggleCount++;
            } else {
                displayInjuries.push(injury)
            }
        }
        if (niggleCount > 0) {
            if (niggleCount === 1) {
                displayInjuries.push('n');
            } else {
                displayInjuries.push(`n${niggleCount}`);
            }
        }

        return displayInjuries.sort().join(', ');
    }

    public get sppDisplayInfo(): any {
        if (! this.teamSheetEntry.hasPlayer()) {
            return null;
        }

        return this.teamSheetEntry.getPlayer().sppDisplayInfo;
    }

    public get sppSummaryText(): string {
        if (! this.teamSheetEntry.hasPlayer()) {
            return '';
        }

        const spendable = this.sppDisplayInfo.spendable;

        const randomPrimaryThreshold = this.sppDisplayInfo.thresholds.randomPrimary;
        const randomPrimaryRequired = randomPrimaryThreshold <= spendable ? 0 : randomPrimaryThreshold - spendable;

        const randomSecondaryOrChosenPrimaryThreshold = this.sppDisplayInfo.thresholds.randomSecondaryOrChosenPrimary;
        const randomSecondaryOrChosenPrimaryRequired = randomSecondaryOrChosenPrimaryThreshold <= spendable ? 0 : randomSecondaryOrChosenPrimaryThreshold - spendable;

        const chosenSecondaryThreshold = this.sppDisplayInfo.thresholds.chosenSecondary;
        const chosenSecondaryRequired = chosenSecondaryThreshold <= spendable ? 0 : chosenSecondaryThreshold - spendable;

        const characteristicThreshold = this.sppDisplayInfo.thresholds.characteristic;
        const characteristicRequired = characteristicThreshold <= spendable ? 0 : characteristicThreshold - spendable;

        return `${randomPrimaryRequired} until random primary (${spendable}/${randomPrimaryThreshold})\n` +
            `${randomSecondaryOrChosenPrimaryRequired} until random secondary or chosen primary (${spendable}/${randomSecondaryOrChosenPrimaryThreshold})\n` +
            `${chosenSecondaryRequired} until chosen secondary (${spendable}/${chosenSecondaryThreshold})\n` +
            `${characteristicRequired} until characteristic (${spendable}/${characteristicThreshold})`;
    }
}

export default toNative(PlayerComponent);
</script>