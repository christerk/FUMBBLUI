<template>
  <div v-show="number > 0" :class="['die', type]" :style="{ 'background-position': bgx+'px ' + bgy + 'px', 'transform': 'rotate('+this.rotate+'deg)' }" />
</template>

<style scoped>
@import './die.less';
</style>

<script lang="ts">
import { Emit, Prop, Component, Vue, toNative } from 'vue-facing-decorator'

@Component
class Die extends Vue {
  @Prop
  type: string = "d6"

  private d6Targets: number[][][];
  private bgx: number = 0;
  private bgy: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private number: number;
  private animationTime: number = 1500;
  private time: number = 0;
  private startX: number = 0;
  private startY: number = 0;
  private rotate: 0;

  public mounted() {
    this.d6Targets = [
      [],
      [[5,0,0], [5,5,0], [5,10,0], [5,15,0]],
      [[0,10,0], [10,0,0]],
      [[0,15,0], [10,5,0]],
      [[0,5,0], [10,15,0]],
      [[0,0,0], [10,10,0]],
      [[15,0,0], [15,5,0], [15,10,0], [15,15,0]],
    ];

    this.d8Targets = [
      [],
      [[0,   6, 180], [10, 16, 0]],
      [[13,  3, 270], [17, 13, 90]],
      [[13, 13, 270], [17,  3, 90]],
      [[0,  10, 0], [10,  0, 180]],
      [[0,   0, 0], [10, 10, 180]],
      [[3,  13, 270], [ 7,  3, 90]],
      [[3,   3, 270], [ 7, 13, 90]],
      [[10,  6, 0], [0,  16, 180]],
    ];    
  }

  public roll(result: number) {
    let t: number;

    if (this.type == 'd6') {
      t = this.d6Targets[result];
    } else if (this.type == 'd8') {
      t = this.d8Targets[result];
    }
    let targetCoordinate = t[Math.floor(Math.random()*t.length)];

    this.rotate = targetCoordinate[2];
    this.number = result;
    this.time = performance.now();

    this.targetX = -50 * targetCoordinate[0];
    this.targetY = -50 * targetCoordinate[1];

    let radius = 5000;
    let angle = Math.random(2 * Math.PI);
    this.startX = this.targetX + radius * Math.cos(angle);
    this.startY = this.targetY + radius * Math.sin(angle);

    this.bgx = this.targetX;
    this.bgy = this.targetY;

    setTimeout(this.tick.bind(this), 16);
  }

  @Emit
  public complete(number: number) {
    return number;
  }

  public tick() {
    let animTime = performance.now() - this.time;

    var pct = animTime / this.animationTime;

    pct = this.ease(Math.min(1, pct));

    if (pct < 1) {
      setTimeout(this.tick.bind(this), 16);
    } else {
      this.complete(this.number);
    }

    let currentX = Math.round((this.targetX + (1-pct)*(this.targetX - this.startX)) / 50);
    let currentY = Math.round((this.targetY + (1-pct)*(this.targetY - this.startY)) / 50);

    this.bgx = ((2000 + currentX)%20) * 50;
    this.bgy = ((1900 + currentY)%19) * 50;
  }

  public ease(t) {
    return t * ( 2 - t );
  }
}

export default toNative(Die)
</script>
