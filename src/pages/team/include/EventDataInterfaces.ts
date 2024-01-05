import { PlayerRowFoldOutMode } from "./Interfaces";

export interface EventDataFoldOut {
  playerNumber: number;
  playerRowFoldOutMode: PlayerRowFoldOutMode;
  multipleOpenMode: boolean;
}

export interface EventDataRemovePlayer {
  playerNumber: number;
  playerId: number;
}

export interface EventDataRefundPlayer {
  playerNumber: number;
  playerId: number;
}