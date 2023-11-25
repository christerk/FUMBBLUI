<template>
  <div class="sortable">
    <Sortable class="sortwrap" :list="Items" item-key="id" :options="options" @change="onChange" @end="onEnd">
      <template #item="{element}">
        <div :class="{sortablerow: true, active: !element.empty}">
          <slot :item="element"></slot>
        </div>
      </template>
    </Sortable>
    <Sortable class="sortwrap" :list="FootItems" item-key="id" :options="options" @change="onChange" @end="onEnd">
      <template #item="{element}">
        <div :class="{sortablerow: true, active: false}">
          <slot :item="element"></slot>
        </div>
      </template>
    </Sortable>

  </div>
</template>

<style scoped>
@import './sortabletable.less';
</style>

<script lang="ts">
import { Component, Vue, toNative, Prop, Emit } from 'vue-facing-decorator'
import { Sortable } from 'sortablejs-vue3'

@Component({
  components: {
    Sortable
  }  
})
class SortableTable extends Vue {
  @Prop
  Items: {empty: boolean, number: number}[] = []

  @Prop
  FootItems:  {empty: boolean, number: number}[] = []

  public options = {
    animation: 150,
    handle: ".handle",
    draggable: ".sortablerow"
  }

  public mounted() {
    for (let i=0; i<this.Items.length; i++) {
      if (this.Items[i].empty) {
        this.Items[i].id = -i;
      }
    }
  }

  @Emit
  public onChange(evt) {
    let oldIndex = evt.oldDraggableIndex;
    let newIndex = evt.newDraggableIndex;

    let min = Math.min(oldIndex, newIndex);
    let max = Math.max(oldIndex, newIndex);

    for (let i=0; i<this.Items.length; i++) {
      let newNumber = i+1;

      if (i >= min && i <= max) {
        if (newIndex > oldIndex && i >= oldIndex && i<= newIndex) newNumber--;
        if (newIndex < oldIndex && i >= newIndex) newNumber++;
      }

      if (i == oldIndex) {
        newNumber = newIndex+1;
      }

      this.Items[i].number = newNumber;
    }


  }

  @Emit
  public onEnd(evt) {
    let item = this.Items.splice(evt.oldDraggableIndex, 1);
    this.Items.splice(evt.newDraggableIndex, 0, item[0]);
  }
}

export default toNative(SortableTable)
</script>
