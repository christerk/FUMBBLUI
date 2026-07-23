<template>
  <div class="toggle">
    <label name="selected.custom" class="toggler-wrapper style-4">
      <input :id="id" type="checkbox" v-model="value" />
      <div class="toggler-slider">
        <div class="toggler-knob"></div>
      </div>
    </label>
  </div>
</template>

<style scoped>
@import "./toggle.less";
</style>

<script lang="ts">
import { Component, Vue, Prop, Emit, toNative } from "vue-facing-decorator";

@Component
class Toggle extends Vue {
  @Prop({ default: false })
  readonly modelValue!: boolean;

  @Prop
  public id: string = "";

  public get value() {
    return this.modelValue;
  }

  set value(v: boolean) {
    this.updateValue(v);
  }

  @Emit("update:modelValue")
  private updateValue(value: boolean): boolean {
    return value;
  }
}
export default toNative(Toggle);
</script>
