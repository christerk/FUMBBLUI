<script lang="ts" setup>
import { ref } from "vue";
import { load } from "./service";
import { useMatchStore } from "../pinia/store";
import { storeToRefs } from "pinia";
import { Store } from "../rating/store";
import IconButton from "../iconButton/IconButton.vue";
import addIcon from "../icons/addIcon.png";

const matchStore = useMatchStore();
const { currentCoachName, stores, errorMessage } = storeToRefs(matchStore);
const { setStore } = matchStore;
const loading = ref(false);

async function loadData() {
  loading.value = true;
  if (stores.value.has(currentCoachName.value)) {
    loading.value = false;
    return;
  }
  const coachName = currentCoachName.value;

  currentCoachName.value = "";

  const store = new Store(coachName);

  loading.value = false;

  try {
    await load(store, errorMessage, (store: Store) => {
      setStore(store.coachName, store);
    });
  } catch (error: any) {
    errorMessage.value = error.message;
  }
}
</script>

<style scoped>
@import "./coachLocator.less";
</style>

<template>
  <div class="search">
    <form id="coachForm">
      <input
        id="coachName"
        v-model="currentCoachName"
        :disabled="loading"
        placeholder="coach name"
        type="text"
        autofocus
      />

      <IconButton
        class="addButton"
        alt="Add coach"
        :callback="loadData"
        :src="addIcon"
        :show-indicator="false"
      />
    </form>
    <div :class="{ active: errorMessage.length > 0 }" class="error">
      {{ errorMessage }}
    </div>
  </div>
</template>
