import { PlayerGender } from "./Interfaces";

export default class UpdatePlayerDetails {
    public playerName: string = ''; // public as used in v-model
    public gender: PlayerGender; // public as used in v-model

    constructor(playerName: string, gender: PlayerGender) {
        this.playerName = playerName;
        this.gender = gender;
    }

    public getPlayerName(): string {
        return this.playerName;
    }

    public setPlayerName(playerName: string): void {
        this.playerName = playerName;
    }

    public getGender(): PlayerGender {
        return this.gender;
    }

    public getErrors(): string[] {
        const errors = [];
        if (this.playerName.trim().length === 0) {
            errors.push('empty_name');
        }
        if (typeof this.gender !== 'string' || this.gender.length === 0) {
            errors.push('empty_gender');
        }
        return errors;
    }
}