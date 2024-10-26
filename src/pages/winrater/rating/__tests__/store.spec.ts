import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Aggregation,
  Graph,
  GraphConfig,
  Range,
  Settings,
  SettingsUpdate,
  Store,
} from "../store";
import type { Category, Match } from "../match";
import { Blackbox, Competitive, FFB_Test, League, Score } from "../match";
import Color from "color";
import { match, randomColor } from "../mapper";
import { createTestingPinia } from "@pinia/testing";
import { useMatchStore } from "../../pinia/store";
import { storeToRefs } from "pinia";
import { reactive } from "vue";
import * as Plot from "@observablehq/plot";
import { Line } from "@observablehq/plot";
import type { FumbblMatch } from "../../coachLocator/fumbblMatch";

vi.mock("../mapper");

const coachName = "coach";
const matches: Match[] = [
  {
    id: 4,
    category: Competitive,
    score: Score.Win,
    dateTime: new Date("2000-01-02T12:34:59"),
  },
  {
    id: 12,
    category: League,
    score: Score.Loss,
    dateTime: new Date("2005-01-02T17:34:12"),
  },
  {
    id: 23,
    category: League,
    score: Score.Win,
    dateTime: new Date("2010-01-02T12:30:10"),
  },
  {
    id: 30,
    category: Blackbox,
    score: Score.Draw,
    dateTime: new Date("2012-01-02T01:05:32"),
  },
  {
    id: 51,
    category: Competitive,
    score: Score.Draw,
    dateTime: new Date("2020-01-02T05:12:05"),
  },
];

describe("Rating Store", () => {
  beforeEach(() => {
    createTestingPinia({ createSpy: vi.fn });
  });

  const color = Color.rgb({ r: 0, g: 0, b: 0 });

  const fumbblMatch1: FumbblMatch = {
    id: 51,
    division: "",
    scheduler: "",
    team1: { coach: { name: "" }, score: 0 },
    team2: { coach: { name: "" }, score: 0 },
    date: "some date",
    time: "some time",
  };

  const fumbblMatch2: FumbblMatch = {
    id: 4,
    division: "",
    scheduler: "",
    team1: { coach: { name: "" }, score: 0 },
    team2: { coach: { name: "" }, score: 0 },
    date: "some date",
    time: "some time",
  };

  const fumbblMatch3: FumbblMatch = {
    id: 30,
    division: "",
    scheduler: "",
    team1: { coach: { name: "" }, score: 0 },
    team2: { coach: { name: "" }, score: 0 },
    date: "some date",
    time: "some time",
  };

  let unsortedMatches: Match[];

  function createUnsortedMatches() {
    return [
      {
        id: 51,
        category: Competitive,
        score: Score.Draw,
        dateTime: new Date("2020-01-02T05:12:05"),
      },
      {
        id: 4,
        category: Competitive,
        score: Score.Win,
        dateTime: new Date("2000-01-02T12:34:59"),
      },
      {
        id: 30,
        category: Blackbox,
        score: Score.Draw,
        dateTime: new Date("2012-01-02T01:05:32"),
      },
      {
        id: 12,
        category: League,
        score: Score.Loss,
        dateTime: new Date("2005-01-02T17:34:12"),
      },
      {
        id: 23,
        category: League,
        score: Score.Win,
        dateTime: new Date("2010-01-02T12:30:10"),
      },
    ];
  }

  let store: Store;

  beforeAll(() => {
    vi.mocked(randomColor).mockImplementation((): Color => {
      return color;
    });
  });

  beforeEach(() => {
    store = new Store(coachName);
    unsortedMatches = createUnsortedMatches();
  });

  describe("init", () => {
    it("sorts matches and creates basic config", () => {
      store["providedMatches"].push(...unsortedMatches);
      store.categories.push(Blackbox, Competitive, FFB_Test, League);
      store.matchCounts.set(Blackbox, 8);
      store.init();

      const matchStore = useMatchStore();
      const { modificationCounter } = storeToRefs(matchStore);
      expect(modificationCounter.value).toBe(1);

      expect(store.matches()).toStrictEqual(matches);
      expect(store.configs.length).toBe(1);
      const expectedConfig = new GraphConfig(
        store.coachName,
        1,
        color,
        reactive([Blackbox, Competitive, League]),
        store["providedMatches"],
        store.matchCounts,
      );
      expect(store.configs[0]).toStrictEqual(expectedConfig);
    });
  });

  describe("addConfig", () => {
    it("adds new default config to array", () => {
      store.categories.push(Blackbox, Competitive, FFB_Test);
      store.matchCounts.set(Blackbox, 8);
      const match = {
        score: Score.Draw,
        id: 1,
        category: Competitive,
        dateTime: new Date(),
      };
      store.providedMatches.push(match);

      store.addConfig();

      const matchStore = useMatchStore();
      const { modificationCounter } = storeToRefs(matchStore);
      expect(modificationCounter.value).toBe(1);

      const config: GraphConfig = new GraphConfig(
        store.coachName,
        1,
        color,
        [Blackbox, Competitive],
        [match],
        store.matchCounts,
      );
      expect(store.configs).toStrictEqual([config]);
    });
  });

  describe("removeConfig", () => {
    it("removes config", () => {
      const configToRemove = new GraphConfig(
        store.coachName,
        1,
        new Color({ r: 0, g: 0, b: 0 }),
        [],
        [],
        new Map<Category, number>(),
      );
      const configToKeep = new GraphConfig(
        store.coachName,
        2,
        new Color({ r: 255, g: 0, b: 0 }),
        [],
        [],
        new Map<Category, number>(),
      );

      const matchStore = useMatchStore();
      const { modificationCounter } = storeToRefs(matchStore);
      modificationCounter.value = 0;
      store.configs = [configToKeep, configToRemove];

      store.removeConfig(configToRemove);

      expect(modificationCounter.value).toBe(1);
      expect(store.configs).toStrictEqual([configToKeep]);
    });

    it("ignores unknown config", () => {
      const configToRemove = new GraphConfig(
        store.coachName,
        1,
        new Color({ r: 0, g: 0, b: 0 }),
        [],
        [],
        new Map<Category, number>(),
      );
      const configToKeep = new GraphConfig(
        store.coachName,
        2,
        new Color({ r: 255, g: 0, b: 0 }),
        [],
        [],
        new Map<Category, number>(),
      );
      store.configs = [configToKeep];

      store.removeConfig(configToRemove);

      expect(store.configs).toStrictEqual([configToKeep]);
    });

    it("does not recycle index", () => {
      const matchStore = useMatchStore();
      const { modificationCounter } = storeToRefs(matchStore);
      modificationCounter.value = 0;
      store.addConfig();
      store.addConfig();
      store.removeConfig(store.configs[0]);
      store.addConfig();

      expect(store.configs[1].configNumber).toBe(3);
    });
  });

  describe("addMatch", () => {
    it("converts matches", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      vi.mocked(match).mockImplementation((fumbblMatch: FumbblMatch): Match => {
        if (fumbblMatch.id === fumbblMatch1.id) {
          return unsortedMatches[0];
        }
        if (fumbblMatch.id === fumbblMatch2.id) {
          return unsortedMatches[1];
        }
        return unsortedMatches[2];
      });

      store.addMatch(fumbblMatch1);
      store.addMatch(fumbblMatch2);
      store.addMatch(fumbblMatch3);

      expect(store.matches()).toStrictEqual(unsortedMatches.slice(0, 3));
      expect(store.categories).toStrictEqual([Blackbox, Competitive]);
    });
  });

  describe("graphs", () => {
    it("collects graphs from configs", () => {
      const config = new GraphConfig(
        "",
        0,
        color,
        [],
        [],
        new Map<Category, number>(),
      );
      const graph = new Graph([], Plot.line());
      config.graph = vi.fn().mockImplementation(() => {
        return graph;
      });
      store.configs.push(config);

      const graphs = store.graphs();
      expect(graphs.length).toBe(1);
      expect(graphs[0]).toBe(graph);
    });
  });
});

describe("Graph Config", () => {
  it("decouples matchCounts", () => {
    const index = 1;
    const color = new Color("#654321");
    const categories = [Competitive];
    const matchCounts = new Map<Category, number>();
    matchCounts.set(Blackbox, 8);
    const config = new GraphConfig(
      coachName,
      index,
      color,
      categories,
      matches,
      matchCounts,
    );

    matchCounts.set(Blackbox, 2);
    expect(config.matchCounts.get(Blackbox)).toBe(8);
  });

  it("creates settings correctly", () => {
    const index = 1;
    const color = new Color("#654321");
    const categories = [Competitive];
    const matchCounts = new Map<Category, number>();
    const config = new GraphConfig(
      coachName,
      index,
      color,
      categories,
      matches,
      matchCounts,
    );

    expect(config.settings).toStrictEqual(
      new Settings(
        matches.length,
        matches[0].id,
        matches[4].id,
        new Date("2000-01-02T00:00:00.000+00:00"),
        new Date("2020-01-02T23:59:59.999+00:00"),
      ),
    );
  });

  it.each([
    { name: "empty", value: [] as Match[] },
    {
      name: "null",
      value: null as unknown as Match[],
    },
  ])("handles settings correctly for $name matches", (param) => {
    const index = 1;
    const color = new Color("#654321");
    const categories = [Competitive];
    const matchCounts = new Map<Category, number>();
    const config = new GraphConfig(
      coachName,
      index,
      color,
      categories,
      param.value,
      matchCounts,
    );

    expect(config.settings.matchCount).toBe(0);
    expect(config.settings.minId).toBe(0);
    expect(config.settings.maxId).toBe(0);
    expect(config.settings.minDate).toBeDefined();
    expect(config.settings.maxDate).toBeDefined();
    expect(config.settings.lowerCount).toBe(0);
    expect(config.settings.upperCount).toBe(0);
    expect(config.settings.lowerId).toBe(0);
    expect(config.settings.upperId).toBe(0);
    expect(config.settings.lowerDate).toBeDefined();
    expect(config.settings.upperDate).toBeDefined();
  });

  describe("toggleCategory", () => {
    it("adds category if it is not present", () => {
      const config = new GraphConfig(
        "coachName",
        1,
        new Color(),
        [Blackbox, Competitive],
        [],
        new Map<Category, number>(),
      );

      config.toggleCategory(League);

      expect(config.categories).toStrictEqual([Blackbox, Competitive, League]);
    });

    it("removes category if it is present", () => {
      const config = new GraphConfig(
        "coachName",
        1,
        new Color(),
        [Blackbox, Competitive],
        [],
        new Map<Category, number>(),
      );

      config.toggleCategory(Competitive);

      expect(config.categories).toStrictEqual([Blackbox]);
    });

    it("does not remove present category if list would be empty then", () => {
      const config = new GraphConfig(
        "coachName",
        1,
        new Color(),
        [League],
        [],
        new Map<Category, number>(),
      );

      config.toggleCategory(League);

      expect(config.categories).toStrictEqual([League]);
    });
  });
  describe("hexColor", () => {
    it("preserves and returns current color as hex", () => {
      const originalColor = "#123456";
      const config = new GraphConfig(
        "coachName",
        1,
        new Color(originalColor),
        [League],
        [],
        new Map<Category, number>(),
      );

      const line: Line = config.graph().line;
      expect(originalColor).toEqual(config.hexColor());
      expect(line).toEqual(config.graph().line);
    });
  });

  describe("updateHexColor", () => {
    it("updates color", () => {
      const originalColor = "#123456";
      const newColor = "#654321";
      const config = new GraphConfig(
        "coachName",
        1,
        new Color(originalColor),
        [League],
        [],
        new Map<Category, number>(),
      );

      const line: Line = config.graph().line;

      config.updateHexColor(newColor);
      expect(line).not.toEqual(config.graph().line);
    });
  });

  describe("graph", () => {
    it("returns a graph with data points for all matches", () => {
      const index = 1;
      const color = new Color("#654321");
      const categories = [Blackbox, Competitive, FFB_Test, League];
      const config = new GraphConfig(
        coachName,
        index,
        color,
        categories,
        matches,
        new Map<Category, number>(),
      );

      const graph = config.graph();
      expect(graph.dataPoints).toStrictEqual([
        {
          id: 4,
          index: 1,
          ratio: 1,
          title: "coach #1",
          dateTime: new Date("2000-01-02T12:34:59"),
        },
        {
          id: 12,
          index: 2,
          ratio: 0.5,
          title: "coach #1",
          dateTime: new Date("2005-01-02T17:34:12"),
        },
        {
          id: 23,
          index: 3,
          ratio: 0.6667,
          title: "coach #1",
          dateTime: new Date("2010-01-02T12:30:10"),
        },
        {
          id: 30,
          index: 4,
          ratio: 0.625,
          title: "coach #1",
          dateTime: new Date("2012-01-02T01:05:32"),
        },
        {
          id: 51,
          index: 5,
          ratio: 0.6,
          title: "coach #1",
          dateTime: new Date("2020-01-02T05:12:05"),
        },
      ]);
      expect(graph.line).not.toBeNull();
    });

    it("returns data points for competitive matches", () => {
      const index = 1;
      const color = new Color("#654321");
      const categories = [Competitive];
      const config = new GraphConfig(
        coachName,
        index,
        color,
        categories,
        matches,
        new Map<Category, number>(),
      );

      const graph = config.graph();
      expect(graph.dataPoints).toStrictEqual([
        {
          id: 4,
          index: 1,
          ratio: 1.0,
          title: "coach #1",
          dateTime: new Date("2000-01-02T12:34:59"),
        },
        {
          id: 51,
          index: 2,
          ratio: 0.75,
          title: "coach #1",
          dateTime: new Date("2020-01-02T05:12:05"),
        },
      ]);
    });
  });
});

describe("Settings", () => {
  let settings: Settings;
  const matchCount = 10;
  const minId = 1;
  const maxId = 10;
  const minDate = new Date("2020-01-01T00:00:00.000+00:00");
  const maxDate = new Date("2022-12-01T23:59:59.999+00:00");
  const earlierDate = new Date("2021-01-01T00:00:00.000+00:00");
  const laterDate = new Date("2021-12-01T23:59:59.999+00:00");
  const tooLateDate = new Date("2023-12-01T23:59:59.999+00:00");
  const tooSoonDate = new Date("2019-12-01T23:59:59.999+00:00");

  beforeEach(() => {
    createTestingPinia({ createSpy: vi.fn });
    settings = new Settings(matchCount, minId, maxId, minDate, maxDate);
  });

  describe("validateUpdate", () => {
    it("ignores invalid range if not selected", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          5,
          10,
          7,
          2,
          laterDate,
          earlierDate,
          1,
          Aggregation.SUM,
          Range.COUNT,
        ),
        errorMessage,
      );

      expect(valid).toBeTruthy();
      expect(errorMessage.value).toBe("");
    });

    it("rejects invalid date range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          5,
          10,
          2,
          7,
          laterDate,
          earlierDate,
          1,
          Aggregation.SUM,
          Range.DATE,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe('"From" must not be larger than "to"');
    });

    it("rejects invalid count range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          10,
          5,
          2,
          7,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.COUNT,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe('"From" must not be larger than "to"');
    });

    it("rejects invalid id range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          5,
          10,
          7,
          2,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.ID,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe('"From" must not be larger than "to"');
    });

    it("rejects too high date range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          5,
          10,
          2,
          7,
          tooLateDate,
          tooLateDate,
          1,
          Aggregation.SUM,
          Range.DATE,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe(
        '"From" must not be larger than 2022-12-01',
      );
    });

    it("rejects too high count range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          11,
          11,
          2,
          7,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.COUNT,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe('"From" must not be larger than 10');
    });

    it("rejects too high id range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          5,
          10,
          20,
          20,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.ID,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe('"From" must not be larger than 10');
    });

    it("rejects too low date range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          5,
          10,
          2,
          7,
          tooSoonDate,
          tooSoonDate,
          1,
          Aggregation.SUM,
          Range.DATE,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe(
        '"To" must not be smaller than 2020-01-01',
      );
    });

    it("rejects too low count range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          0,
          0,
          2,
          7,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.COUNT,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe('"To" must not be smaller than 1');
    });

    it("rejects too low id range", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          5,
          10,
          0,
          0,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.ID,
        ),
        errorMessage,
      );

      expect(valid).toBeFalsy();
      expect(errorMessage.value).toBe('"To" must not be smaller than 1');
    });

    it("accepts count range exceeding limits", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          0,
          11,
          2,
          7,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.COUNT,
        ),
        errorMessage,
      );

      expect(valid).toBeTruthy();
      expect(errorMessage.value).toBe("");
    });

    it("accepts id range exceeding limits", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          2,
          5,
          0,
          20,
          earlierDate,
          laterDate,
          1,
          Aggregation.SUM,
          Range.ID,
        ),
        errorMessage,
      );

      expect(valid).toBeTruthy();
      expect(errorMessage.value).toBe("");
    });

    it("accepts date range exceeding limits", () => {
      const matchStore = useMatchStore();
      const { errorMessage } = storeToRefs(matchStore);
      const valid = settings.validateUpdate(
        new SettingsUpdate(
          2,
          5,
          2,
          7,
          tooSoonDate,
          tooLateDate,
          1,
          Aggregation.SUM,
          Range.DATE,
        ),
        errorMessage,
      );

      expect(valid).toBeTruthy();
      expect(errorMessage.value).toBe("");
    });
  });
});
