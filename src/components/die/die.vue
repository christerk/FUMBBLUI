<template>
  <div class="preload">
    <img v-if="type == 'd6'" src="https://fumbbl.com/i/562665" />
    <img v-if="type == 'd8'" src="https://fumbbl.com/i/562717" />
  </div>
  <div
    v-show="number > 0"
    :class="['die', type]"
    :style="{
      'background-position': bgx + 'px ' + bgy + 'px',
      transform: 'rotate(' + rotate + 'deg)',
    }"
  />
</template>

<style scoped>
@import "./die.less";
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from "vue-facing-decorator";

@Component
class Die extends Vue {
  @Prop
  type: string = "d6";

  private d6Targets: number[][][] = [];
  private d8Targets: number[][][] = [];
  public bgx: number = 0;
  public bgy: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  public number: number = 0;
  private animationTime: number = 1500;
  private time: number = 0;
  private startX: number = 0;
  private startY: number = 0;
  public rotate: number = 0;

  public mounted() {
    this.d6Targets = [
      [],
      [
        [5, 0, 0],
        [5, 5, 0],
        [5, 10, 0],
        [5, 15, 0],
      ],
      [
        [0, 10, 0],
        [10, 0, 0],
      ],
      [
        [0, 15, 0],
        [10, 5, 0],
      ],
      [
        [0, 5, 0],
        [10, 15, 0],
      ],
      [
        [0, 0, 0],
        [10, 10, 0],
      ],
      [
        [15, 0, 0],
        [15, 5, 0],
        [15, 10, 0],
        [15, 15, 0],
      ],
    ];

    this.d8Targets = [
      [],
      [
        [0, 6, 180],
        [10, 16, 0],
      ],
      [
        [13, 3, 270],
        [17, 13, 90],
      ],
      [
        [13, 13, 270],
        [17, 3, 90],
      ],
      [
        [0, 10, 0],
        [10, 0, 180],
      ],
      [
        [0, 0, 0],
        [10, 10, 180],
      ],
      [
        [3, 13, 270],
        [7, 3, 90],
      ],
      [
        [3, 3, 270],
        [7, 13, 90],
      ],
      [
        [10, 6, 0],
        [0, 16, 180],
      ],
    ];
  }

  public roll(result: number) {
    let t: number[][];

    if (this.type == "d6") {
      t = this.d6Targets[result];
    } else if (this.type == "d8") {
      t = this.d8Targets[result];
    } else {
      return;
    }

    const targetCoordinate = t[Math.floor(Math.random() * t.length)];

    this.rotate = targetCoordinate[2];
    this.number = result;
    this.time = performance.now();

    this.targetX = -50 * targetCoordinate[0];
    this.targetY = -50 * targetCoordinate[1];

    const radius = 5000;
    const angle = 2 * Math.PI * Math.random();
    this.startX = this.targetX + radius * Math.cos(angle);
    this.startY = this.targetY + radius * Math.sin(angle);

    this.bgx = this.targetX;
    this.bgy = this.targetY;

    window.requestAnimationFrame(() => this.tick());
  }

  @Emit
  public complete(number: number) {
    return number;
  }

  public tick() {
    const animTime = performance.now() - this.time;
    const pct = this.ease(Math.min(1, animTime / this.animationTime));

    if (pct < 1) {
      window.requestAnimationFrame(() => this.tick());
    } else {
      this.complete(this.number);
    }

    const currentX = Math.round(
      (this.targetX + (1 - pct) * (this.targetX - this.startX)) / 50,
    );
    const currentY = Math.round(
      (this.targetY + (1 - pct) * (this.targetY - this.startY)) / 50,
    );

    this.bgx = ((2000 + currentX) % 20) * 50;
    this.bgy = ((1900 + currentY) % 19) * 50;
  }

  public ease(t: number) {
    return t * (2 - t);
  }
}

export default toNative(Die);
</script>
