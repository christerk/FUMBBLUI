import { defineStore } from "pinia";
import { ref } from "vue";
import { Ref } from "vue";
import type { Store } from "../rating/store";
import { GraphConfig } from "../rating/store";

export const useMatchStore = defineStore("matches", () => {
  const currentCoachName = ref("");
  const stores = ref(new Map<string, Store>());
  const modificationCounter = ref(0);
  const editedConfig: Ref<GraphConfig | undefined> = ref();
  const errorMessage: Ref<string> = ref("");

  function setStore(key: string, value: Store) {
    stores.value.set(key, value);
  }

  return {
    currentCoachName,
    setStore,
    stores,
    modificationCounter,
    editedConfig,
    errorMessage,
  };
});
