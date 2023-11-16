import { PlayerRowFoldOutMode } from "./Interfaces";
import Player from "./Player";
import UpdatePlayerDetails from "./UpdatePlayerDetails";

export default class TeamSheetEntry {
    private entryNumber: number;
    private entryPlayer: Player | null;
    private isUpdating: boolean = false;
    private updatePlayerDetails: UpdatePlayerDetails | null;
    private isDragSource: boolean = false;
    private isDropTarget: boolean = false;
    private foldOut: PlayerRowFoldOutMode = 'CLOSED';

    constructor(entryNumber: number, entryPlayer: Player | null) {
        this.entryNumber = entryNumber;
        this.entryPlayer = entryPlayer;
        this.refreshUpdatePlayerDetails();
    }

    public refreshUpdatePlayerDetails() {
        if (this.entryPlayer) {
            this.updatePlayerDetails = new UpdatePlayerDetails(
                this.entryPlayer.getPlayerName(),
                this.entryPlayer.getGender(),
            );
        }
    }

    public getNumber(): number {
        return this.entryNumber;
    }

    public getPlayer(): Player | null {
        return this.entryPlayer;
    }

    public getIsJourneyman(): boolean {
        if (! this.hasPlayer()) {
            return false;
        }
        return this.entryPlayer.getIsJourneyman();
    }

    public getIsUpdating(): boolean {
        return this.isUpdating;
    }

    public setIsUpdating(isUpdating: boolean) {
        this.isUpdating = isUpdating;
    }

    public getUpdatePlayerDetails(): UpdatePlayerDetails {
        return this.updatePlayerDetails;
    }

    public hasPlayer(): any {
        return this.entryPlayer !== null;
    }

    public hasRosteredPlayer(): any {
        return this.hasPlayer() && this.getIsJourneyman() === false;
    }

    public isFirst(): boolean {
        return this.entryNumber === 1;
    }

    public getIsDragSource(): boolean {
        return this.isDragSource;
    }

    public setIsDragSource(isDragSource: boolean): void {
        this.isDragSource = isDragSource;
    }

    public getIsDropTarget(): boolean {
        return this.isDropTarget;
    }

    public setIsDropTarget(isDropTarget: boolean): void {
        this.isDropTarget = isDropTarget;
    }

    public getFoldOut(): PlayerRowFoldOutMode {
        return this.foldOut;
    }

    public setFoldOut(foldOutValue: PlayerRowFoldOutMode): void {
        this.foldOut = foldOutValue;
    }

    public saveUpdatePlayerDetails() {
        this.entryPlayer.updatePlayerDetails(this.updatePlayerDetails);
    }
}