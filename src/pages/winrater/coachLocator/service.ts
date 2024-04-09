import type { Ref } from "vue";
import type { Store } from "../rating/store";
import type { FumbblMatch } from "@/pages/winrater/coachLocator/fumbblMatch";

const BASE_URL = "https://fumbbl.com/api/";

const MATCH_API = BASE_URL + "match/list/";

const COACH_SEARCH_API = BASE_URL + "coach/search/";

export async function load(
  store: Store,
  errorMessage: Ref<string>,
  success: Function,
): Promise<void> {
  try {
    const coachName = store.coachName;

    errorMessage.value = "";

    if (coachName == null || coachName.trim().length == 0) {
      errorMessage.value = "No coach name given";
      return;
    }

    const searchResponse: Response = await fetch(COACH_SEARCH_API + coachName);

    const searchResult: { name: string }[] = await searchResponse.json();

    const foundNames = searchResult.filter(
      (value) => value.name.toLowerCase() === coachName.toLowerCase(),
    );
    if (foundNames.length != 1) {
      errorMessage.value = "Unknown coach '" + coachName + "'";
      return;
    } else {
      store.coachName = foundNames[0].name;
    }

    success(store);

    let lastResponse: FumbblMatch[];

    let lastId: number = -1;

    do {
      let url: string = MATCH_API + coachName;
      if (lastId != -1) {
        url = url + "/" + lastId;
      }
      lastResponse = await (await window.fetch(url)).json();
      for (const element of lastResponse) {
        if (element.id != lastId) {
          store.addMatch(element);
          lastId = element.id;
        }
      }
      lastId = lastResponse[lastResponse.length - 1].id;
    } while (lastResponse.length > 1);

    store.init();
  } catch (error) {
    console.log(error);
    errorMessage.value = "Could not load data, check your network connection";
  }
}
