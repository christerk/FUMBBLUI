<script lang="ts" setup>
import CoachLookup from "./coachLocator/Component.vue";
import Rating from "./rating/Component.vue";
import Graph from "./graph/Component.vue";
import { useMatchStore } from "./pinia/store";
import { storeToRefs } from "pinia";
import DescriptionHeader from "./descriptionheader/DescriptionHeader.vue";
import ConfigEditor from "./editor/ConfigEditor.vue";

const matchStore = useMatchStore();
const { stores, editedConfig } = storeToRefs(matchStore);
</script>

<template>
  <header>
    <DescriptionHeader />
    <CoachLookup class="lookup" />
  </header>

  <main>
    <div class="separator" />
    <ConfigEditor v-if="editedConfig" />
    <div class="ratings">
      <Rating
        v-for="store in stores.values()"
        :key="store.coachName"
        :store="store"
      />
    </div>
    <Graph />
  </main>
</template>

<style scoped>
@import "./winrater.less";
</style>
