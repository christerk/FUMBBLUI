<template>
  <div class="sortable">
    <Sortable
      class="sortwrap"
      :list="Items"
      item-key="key"
      :options="options"
      @change="onChange"
      @end="onEnd"
    >
      <template #item="{ element }">
        <div :class="{ sortablerow: true, active: !element.empty }">
          <slot :item="element"></slot>
        </div>
      </template>
    </Sortable>
    <Sortable
      v-if="FootItems.length > 0"
      class="sortwrap"
      :list="FootItems"
      item-key="key"
      :options="options"
      @change="onChange"
      @end="onEnd"
    >
      <template #item="{ element }">
        <div :class="{ sortablerow: true, active: !element.empty }">
          <slot :item="element"></slot>
        </div>
      </template>
    </Sortable>
  </div>
</template>

<script lang="ts">
import { Component, Vue, toNative, Prop, Emit } from "vue-facing-decorator";
import { Sortable } from "sortablejs-vue3";

@Component({
  components: {
    Sortable,
  },
})
class SortableTable extends Vue {
  @Prop
  Items: { empty: boolean; number: number; id: number }[] = [];

  @Prop
  FootItems: { empty: boolean; number: number }[] = [];

  public options = {
    animation: 150,
    handle: ".handle",
    draggable: ".sortablerow",
  };

  public mounted() {
    for (let i = 0; i < this.Items.length; i++) {
      if (this.Items[i].empty) {
        this.Items[i].id = -i;
      }
    }
  }

  @Emit
  public onChange(evt: any) {
    const oldIndex = evt.oldDraggableIndex;
    const newIndex = evt.newDraggableIndex;

    const min = Math.min(oldIndex, newIndex);
    const max = Math.max(oldIndex, newIndex);

    for (let i = 0; i < this.Items.length; i++) {
      let newNumber = i + 1;

      if (i >= min && i <= max) {
        if (newIndex > oldIndex && i >= oldIndex && i <= newIndex) newNumber--;
        if (newIndex < oldIndex && i >= newIndex) newNumber++;
      }

      if (i == oldIndex) {
        newNumber = newIndex + 1;
      }

      this.Items[i].number = newNumber;
    }
  }

  @Emit
  public onEnd(evt: any) {
    if (evt.oldDraggableIndex > evt.newDraggableIndex) {
      const item = this.Items.splice(evt.oldDraggableIndex, 1);
      this.Items.splice(evt.newDraggableIndex, 0, item[0]);
    } else {
      const items = this.Items.splice(
        evt.oldDraggableIndex + 1,
        evt.newDraggableIndex - evt.oldDraggableIndex,
      );
      const args: any = [evt.oldDraggableIndex, 0].concat(items);
      Array.prototype.splice.apply(this.Items, args);
    }
  }
}

export default toNative(SortableTable);
</script>
