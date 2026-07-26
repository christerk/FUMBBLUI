import "../../style/main.less";

import { createApp } from "vue";
import { createPinia } from "pinia";
import Ruleset from "./ruleset.vue";

const app = createApp(Ruleset);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");
