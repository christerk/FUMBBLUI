<template>
  <div :class="{ pillwrapper: true, unwrap: unwrap }">
    <button v-if="label" class="pill label" disabled>
      <slot name="label">{{ label }}</slot>
    </button>
    <template v-if="type === 'select'">
      <select
        class="pill"
        v-model="currentValue"
        :key="currentValue"
        @change="onSelectChanged"
      >
        <option v-for="value in values" :key="value.name" :value="value.name">
          {{ value.label }}
        </option>
      </select>
    </template>
    <template v-else>
      <button
        v-for="value in values"
        :key="value.name"
        :class="{ pill: true, active: currentValue === value.name }"
        @click="onSelect(value.name)"
        type="button"
      >
        {{ value.label }}
      </button>
    </template>
    <slot />
  </div>
</template>

<script lang="ts">
import { Model, Component, Vue, Prop, Emit } from "vue-facing-decorator";

@Component({
  name: "Pill",
})
export default class Pill extends Vue {
  @Prop({ required: false, type: String })
  label?: string;

  @Prop({ required: true, type: Array })
  values!: Array<{ name: string; label: string }>;

  @Prop({ required: false, type: String, default: "button" })
  type: string;

  @Prop({ required: false, type: Boolean, default: false })
  unwrap: boolean;

  @Model()
  currentValue: string;

  @Emit("change")
  emitChange(newValue: string) {
    return newValue;
  }

  public selectedValue: string = "";

  public mounted() {
    if (this.type === "select") {
      this.selectedValue = this.currentValue;
    }
  }

  onSelect(value: string) {
    if (value === this.currentValue) {
      return;
    }
    this.currentValue = value;
    this.emitChange(value);
  }

  onSelectChanged(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    this.currentValue = value;
    this.emitChange(value);
  }
}
</script>

<style scoped>
@import "./pill.less";
</style>
