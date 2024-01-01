import { PlayerRowFoldOutMode } from "./Interfaces";

export interface EventDataFoldOut {
  teamSheetEntryNumber: number;
  playerRowFoldOutMode: PlayerRowFoldOutMode;
  multipleOpenMode: boolean;
}

export interface EventDataRemovePlayer {
  teamSheetEntryNumber: number;
  playerId: number;
}
