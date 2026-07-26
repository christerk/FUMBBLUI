<template>
  <input type="text" v-model="local" :size="size" />
</template>

<script lang="ts">
import { Component, Vue, toNative, Prop, Emit } from "vue-facing-decorator";

export function expandShorthand(val: string): string {
  if (!val) return val;
  const match = val.match(/^(\d+(?:\.\d+)?)\s*([kmb])\s*$/i);
  if (!match) return val;
  const num = parseFloat(match[1]);
  const suffix = match[2].toLowerCase();
  const multiplier = suffix === "k" ? 1000 : suffix === "m" ? 1_000_000 : 1_000_000_000;
  return String(Math.round(num * multiplier));
}

@Component
class ExpandingInput extends Vue {
  @Prop({ type: [String, Number], default: "" })
  public modelValue!: string | number;

  @Prop({ type: [String, Number], default: undefined })
  public size?: string | number;

  public get local(): string {
    return String(this.modelValue);
  }

  public set local(val: string) {
    const expanded = expandShorthand(val);
    let out: string | number = expanded;
    if (typeof this.modelValue === "number") {
      out = parseFloat(expanded);
      if (isNaN(out)) out = 0;
    }
    this.emitValue(out);
  }

  @Emit("update:modelValue")
  public emitValue(val: string | number) {
    return val;
  }
}

export default toNative(ExpandingInput);
</script>
