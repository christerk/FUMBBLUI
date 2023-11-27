<template>
    <div class="readytoplay">
        <div v-if="journeymanQuantityInputs.length > 1" class="journeymenquantities">
            <div>
                <div class="journeymenrequiredinfo">{{ journeymanQuantityForNextGame }} journeymen required.</div>
                <div v-for="journeymanQuantityInput of journeymanQuantityInputs" :key="journeymanQuantityInput.positionId" class="journeymanoption">
                    <input
                        :id="'journeymanQuantity_' + journeymanQuantityInput.positionId"
                        type="range"
                        min="0"
                        :max="journeymanQuantityForNextGame"
                        v-model.number="journeymanQuantityInput.quantity"
                        @change="handleQuantityChange(journeymanQuantityInput.positionId)"
                        @input="handleQuantityChange(journeymanQuantityInput.positionId)"
                    >
                    <label :for="'journeymanQuantity_' + journeymanQuantityInput.positionId" title="Use range slider to adjust number of journeymen for this position.">
                        <span class="journeymanquantity">{{ journeymanQuantityInput.quantity }}</span> {{ journeymanQuantityInput.positionName }}
                    </label>
                </div>
            </div>
        </div>
        <div class="readytoplaybuttonarea">
            <button v-if="isValidJourneymanQuantityChoices" class="teambutton" @click="triggerReadyToPlay">Ready to play</button>
            <div v-else>Incorrect number of journeymen chosen, {{ journeymanQuantityForNextGame }} needed, {{ totalJourneymenChosen }} selected.</div>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType, ref } from "vue";
import { Prop, Component, Vue, toNative, Emit } from 'vue-facing-decorator'
import { JourneymanQuantityChoice, JourneymanQuantityInput, Position } from "../include/Interfaces";

@Component
class ReadyToPlayComponent extends Vue {
    @Prop({
        type: Number,
        required: true,
    })
    public journeymanQuantityForNextGame!: number;

    @Prop({
        type: Array as PropType<Position[]>,
        required: true,
    })
    public journeymanPositions!: Position[];

    @Emit('ready-to-play')
    public triggerReadyToPlay(): JourneymanQuantityChoice[] {
        return this.journeymanQuantityChoices;
    }

    public journeymanQuantityInputs: JourneymanQuantityInput[] = [];

    mounted() {
        if (this.journeymanPositions.length > 1) {
            this.journeymanQuantityInputs = this.journeymanPositions.map(position => {
                return {
                    positionId: position.id,
                    positionName: position.name,
                    quantity: ref(0),
                }
            });
            this.journeymanQuantityInputs[0].quantity = this.journeymanQuantityForNextGame
        }
    }

    public get totalJourneymenChosen(): number {
        return this.journeymanQuantityInputs.reduce(
            (accumulator, currentValue) => accumulator + currentValue.quantity,
            0,
        );
    }

    public get isValidJourneymanQuantityChoices(): boolean {
        if (this.journeymanPositions.length <= 2) {
            return true;
        }

        return this.totalJourneymenChosen === this.journeymanQuantityForNextGame;
    }

    public get journeymanQuantityChoices(): JourneymanQuantityChoice[] {
        if (this.journeymanPositions.length === 1) {
            return [{positionId: this.journeymanPositions[0].id, quantity: this.journeymanQuantityForNextGame}];
        }

        return this.journeymanQuantityInputs;
    }

    public handleQuantityChange(positionId: number) {

      let updatingIndex = this.journeymanQuantityInputs.findIndex(i => i.positionId === positionId);
      let delta = this.journeymanQuantityForNextGame - this.journeymanQuantityInputs.reduce((total, i) => total += i.quantity, 0);

      if (delta < 0) {
        let currentIndex = updatingIndex + 1;
        // Try lower rows
        while (delta < 0 && currentIndex < this.journeymanQuantityInputs.length) {
          if (this.journeymanQuantityInputs[currentIndex].quantity > 0) {
            delta++;
            this.journeymanQuantityInputs[currentIndex].quantity--;
          } else {
            currentIndex++;
          }
        }

        currentIndex = updatingIndex - 1;
        // Try higher rows
        while (delta < 0 && currentIndex >= 0) {
          if (this.journeymanQuantityInputs[currentIndex].quantity > 0) {
            delta++;
            this.journeymanQuantityInputs[currentIndex].quantity--;
          } else {
            currentIndex--;
          }          
        }
      } else if (delta > 0) {
        if (updatingIndex < this.journeymanQuantityInputs.length-1) {
          this.journeymanQuantityInputs[updatingIndex + 1].quantity += delta;
        } else if (updatingIndex > 0) {
          this.journeymanQuantityInputs[updatingIndex - 1].quantity += delta;
        }
      }
    }
}

export default toNative(ReadyToPlayComponent);
</script>