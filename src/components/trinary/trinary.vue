<template>
  <div class="trinaryswitch" :key="state">
    {{ state }}
    <input
      type="radio"
      :id="idLeft"
      :name="name"
      value="L"
      :checked="state == 'L'"
      v-on:change="changed"
    />
    <label :for="idLeft" class="switch__label">{{ leftLabel }}</label>

    <input
      type="radio"
      :id="idMid"
      :name="name"
      value="M"
      :checked="state != 'L' && state != 'R'"
      v-on:change="changed"
    />
    <label :for="idMid" class="switch__label">{{ midLabel }}</label>

    <input
      type="radio"
      :id="idRight"
      :name="name"
      value="R"
      :checked="state == 'R'"
      v-on:change="changed"
    />
    <label :for="idRight" class="switch__label">{{ rightLabel }}</label>

    <div :data-before="selectedLabel()" class="switch__indicator">
      <div class="int"></div>
    </div>
  </div>
</template>

<style scoped>
@import "./trinary.less";
</style>

<script lang="ts">
import { Component, Vue, Prop, Emit, toNative } from "vue-facing-decorator";

@Component
class Trinary extends Vue {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) state!: string;

  @Prop({ default: "No" }) leftLabel!: string;
  @Prop({ default: "??" }) midLabel!: string;
  @Prop({ default: "Yes" }) rightLabel!: string;

  public idLeft!: string;
  public idMid!: string;
  public idRight!: string;

  async beforeMount() {
    let componentId = this.uuid();
    this.idLeft = componentId.replace("-", "L");
    this.idMid = componentId.replace("-", "M");
    this.idRight = componentId.replace("-", "R");
  }

  public async mounted() {}

  private uuid() {
    let re: any = /[018]/g;
    return "10000000-1000-4000-8000-100000000000".replace(re, (c: any) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16),
    );
  }

  public selectedLabel() {
    return this.state == "L"
      ? this.leftLabel
      : this.state == "R"
        ? this.rightLabel
        : this.midLabel;
  }

  public changed(event: any) {
    this.stateChanged(this.name, event.target.value);
  }

  @Emit("stateChanged")
  private stateChanged(name: string, newValue: string) {
    return [name, newValue];
  }
}
export default toNative(Trinary);
</script>
