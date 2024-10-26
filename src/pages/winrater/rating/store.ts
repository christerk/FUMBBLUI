import type { Category, Match } from "./match";
import Color from "color";
import { reactive, Ref } from "vue";
import { match, randomColor } from "./mapper";
import { useMatchStore } from "../pinia/store";
import { storeToRefs } from "pinia";
import * as Plot from "@observablehq/plot";
import { Line } from "@observablehq/plot";
import { FumbblMatch } from "@/pages/winrater/coachLocator/fumbblMatch";

function updateCounter() {
  const { modificationCounter } = storeToRefs(useMatchStore());
  modificationCounter.value += 1;
}

export abstract class MatchProvider {
  abstract matches(): Match[];

  abstract matchCounts: Map<Category, number>;
}

export class Store extends MatchProvider {
  public coachName: string;

  public providedMatches: Match[];
  public categories: Category[];

  configs: GraphConfig[] = [];
  public ready = false;
  private configCounter = 0;
  public matchCounts: Map<Category, number>;

  constructor(coachName: string) {
    super();
    this.coachName = coachName;
    this.providedMatches = reactive([]);
    this.categories = reactive([]);
    this.matchCounts = reactive(new Map());
  }

  init() {
    this.providedMatches.sort((a: Match, b: Match) => {
      return a.id - b.id;
    });
    this.ready = true;
    this.addConfig();
  }

  addConfig() {
    const config = new GraphConfig(
      this.coachName,
      ++this.configCounter,
      randomColor(),
      this.categories.filter((cat) => cat.valid),
      this.providedMatches,
      this.matchCounts,
    );

    this.configs.push(config);
  }

  removeConfig(config: GraphConfig) {
    const index = this.configs.indexOf(config);
    if (index >= 0) {
      this.configs.splice(index, 1);
    }
    updateCounter();
  }

  graphs(): Graph[] {
    return this.configs.map((config) => config.graph());
  }

  addMatch(fumbblMatch: FumbblMatch) {
    const newMatch: Match = match(fumbblMatch, this.coachName);
    this.providedMatches.push(newMatch);

    if (this.categories.indexOf(newMatch.category) < 0) {
      this.categories.push(newMatch.category);
      this.categories.sort((a: Category, b: Category) =>
        a.name.toString().localeCompare(b.name.toString()),
      );
    }

    const oldCount = this.matchCounts.get(newMatch.category) || 0;

    this.matchCounts.set(newMatch.category, oldCount + 1);
  }

  matches(): Match[] {
    return this.providedMatches;
  }
}

export class GraphConfig extends MatchProvider {
  public categories: Category[];
  public color: Color;
  private readonly providedMatches: Match[];
  private categoryMatches: Match[];
  private filteredMatches: Match[];
  private dataPoints: DataPoint[];
  private readonly coachName: string;
  public readonly configNumber: number;
  public matchCounts: Map<Category, number>;
  private line: Line;
  public settings: Settings;

  constructor(
    coachName: string,
    configNumber: number,
    color: Color,
    categories: Category[],
    matches: Match[],
    matchCounts: Map<Category, number>,
  ) {
    super();
    this.coachName = coachName;
    this.configNumber = configNumber;
    this.color = color;
    this.categories = categories;
    this.providedMatches = matches ? matches : [];
    this.dataPoints = [];
    this.filteredMatches = [];
    this.categoryMatches = [];
    this.line = Plot.line();
    this.matchCounts = reactive(new Map<Category, number>(matchCounts));
    if (this.providedMatches && this.providedMatches.length > 0) {
      const matchCount = this.providedMatches.length;
      const minDate = createStartOfDayDate(this.providedMatches[0].dateTime);
      const maxDate = createEndOfDayDate(
        this.providedMatches[matchCount - 1].dateTime,
      );

      this.settings = new Settings(
        matchCount,
        this.providedMatches[0].id,
        this.providedMatches[matchCount - 1].id,
        minDate,
        maxDate,
      );
    } else {
      this.settings = new Settings(0, 0, 0, new Date(), new Date());
    }
    this.update(UpdateDepth.ALL, false);
  }

  resetSettings() {
    if (this.providedMatches && this.providedMatches.length > 0) {
      const matchCount = this.providedMatches.length;
      const minDate = createStartOfDayDate(this.providedMatches[0].dateTime);
      const maxDate = createEndOfDayDate(
        this.providedMatches[matchCount - 1].dateTime,
      );

      this.settings = new Settings(
        matchCount,
        this.providedMatches[0].id,
        this.providedMatches[matchCount - 1].id,
        minDate,
        maxDate,
      );
    } else {
      this.settings = new Settings(0, 0, 0, new Date(), new Date());
    }
  }

  toggleCategory(category: Category) {
    const index = this.categories.indexOf(category);

    if (index >= 0) {
      if (this.categories.length > 1) {
        this.categories.splice(index, 1);
      }
    } else {
      this.categories.push(category);
    }
    this.update();
  }

  public updateHexColor(newColor: string) {
    this.color = this.color.hex(newColor);
    this.updateLine();
    updateCounter();
  }

  hexColor() {
    return this.color.hex();
  }

  update(depth: UpdateDepth = UpdateDepth.ALL, updateCounts: boolean = true) {
    if (depth >= UpdateDepth.ALL) {
      this.categoryMatches = this.providedMatches.filter(
        (match) => this.categories.indexOf(match.category) > -1,
      );
    }

    if (depth >= UpdateDepth.RANGE) {
      this.filteredMatches = this.categoryMatches.filter(
        (match: Match, index: number) =>
          this.settings.isInRange(match, index + 1),
      );
    }

    if (depth >= UpdateDepth.AGGREGATION) {
      if (this.settings.aggregation == Aggregation.SUM) {
        this.dataPoints = this.accumulated(this.filteredMatches);
      } else {
        const lastWindowStart = Math.max(
          this.filteredMatches.length - this.settings.windowSize,
          0,
        );
        const sliceSize = Math.min(
          this.filteredMatches.length,
          this.settings.windowSize,
        );
        this.dataPoints = [];
        if (sliceSize > 0) {
          for (let index = 0; index <= lastWindowStart; index++) {
            const windowData = this.accumulated(
              this.filteredMatches.slice(index, index + sliceSize),
            );
            const lastData: DataPoint = windowData[sliceSize - 1];
            lastData.index = index + 1;
            this.dataPoints.push(lastData);
          }
        }
      }

      this.updateLine();
      if (updateCounts) {
        for (const key of this.matchCounts.keys()) {
          this.matchCounts.set(key, 0);
        }
        this.filteredMatches.forEach((match) => {
          const category = match.category;
          const oldCount = this.matchCounts.get(category) || 0;
          this.matchCounts.set(category, oldCount + 1);
        });
      }
      updateCounter();
    }
  }

  private updateLine(): void {
    this.line = Plot.line(this.dataPoints, {
      x: "index",
      y: "ratio",
      z: this.getTitle(),
      title: "title",
      stroke: this.color.rgb().string(),
    });
  }

  matches(): Match[] {
    return this.filteredMatches;
  }

  graph(): Graph {
    return new Graph(this.dataPoints, this.line);
  }

  private accumulated(matches: Match[]): DataPoint[] {
    let accumulatedScore: number = 0;

    return matches.map((match, index) => {
      accumulatedScore += match.score;
      return {
        index: index + 1,
        ratio: Math.round((accumulatedScore / (index + 1)) * 10000) / 10000,
        title: this.getTitle(),
        id: match.id,
        dateTime: match.dateTime,
      };
    });
  }

  public getTitle() {
    return this.coachName + " #" + this.configNumber;
  }

  updateIfChanged(settingsUpdate: SettingsUpdate, errorMessage: Ref<string>) {
    const isValid = this.settings.validateUpdate(settingsUpdate, errorMessage);

    if (isValid) {
      let updateDepth = UpdateDepth.NONE;
      if (
        this.settings.aggregation != settingsUpdate.aggregation ||
        (settingsUpdate.aggregation == Aggregation.WINDOW &&
          this.settings.windowSize != settingsUpdate.windowSize)
      ) {
        updateDepth = UpdateDepth.AGGREGATION;
      }
      if (this.settings.range != settingsUpdate.range) {
        updateDepth = UpdateDepth.RANGE;
      } else {
        if (
          settingsUpdate.range == Range.COUNT &&
          (this.settings.lowerCount != settingsUpdate.lowerCount ||
            this.settings.upperCount != settingsUpdate.upperCount)
        ) {
          updateDepth = UpdateDepth.RANGE;
        } else if (
          settingsUpdate.range == Range.ID &&
          (this.settings.lowerId != settingsUpdate.lowerId ||
            this.settings.upperId != settingsUpdate.upperId)
        ) {
          updateDepth = UpdateDepth.RANGE;
        } else if (
          settingsUpdate.range == Range.DATE &&
          (this.settings.lowerDate != settingsUpdate.lowerDate ||
            this.settings.upperDate != settingsUpdate.upperDate)
        ) {
          updateDepth = UpdateDepth.RANGE;
        }
      }
      this.settings.update(settingsUpdate);
      this.update(updateDepth);
    }

    return isValid;
  }
}

enum UpdateDepth {
  NONE,
  AGGREGATION,
  RANGE,
  ALL,
}

export class Graph {
  dataPoints: DataPoint[];
  line: Line;

  constructor(dataPoints: DataPoint[], line: Line) {
    this.dataPoints = dataPoints;
    this.line = line;
  }
}

export type DataPoint = {
  index: number;
  ratio: number;
  title: string;
  id: number;
  dateTime: Date;
};

export class Settings {
  matchCount: number;
  minId: number;
  maxId: number;
  minDate: Date;
  maxDate: Date;
  lowerCount: number;
  upperCount: number;
  lowerId: number;
  upperId: number;
  lowerDate: Date;
  upperDate: Date;
  windowSize: number;
  range: Range;
  aggregation: Aggregation;

  constructor(
    matchCount: number,
    minId: number,
    maxId: number,
    minDate: Date,
    maxDate: Date,
  ) {
    this.matchCount = matchCount;
    this.minId = minId;
    this.maxId = maxId;
    this.minDate = minDate;
    this.maxDate = maxDate;
    this.lowerCount = Math.min(1, this.matchCount);
    this.upperCount = this.matchCount;
    this.lowerId = this.minId;
    this.upperId = this.maxId;
    this.lowerDate = this.minDate;
    this.upperDate = this.maxDate;
    this.windowSize = 1;
    this.range = Range.COUNT;
    this.aggregation = Aggregation.SUM;
  }

  update(settingsUpdate: SettingsUpdate) {
    this.lowerCount = settingsUpdate.lowerCount;
    this.upperCount = settingsUpdate.upperCount;
    this.lowerId = settingsUpdate.lowerId;
    this.upperId = settingsUpdate.upperId;
    this.lowerDate = settingsUpdate.lowerDate;
    this.upperDate = settingsUpdate.upperDate;
    this.range = settingsUpdate.range;
    this.aggregation = settingsUpdate.aggregation;
    this.windowSize = settingsUpdate.windowSize;
  }

  validateUpdate(settingsUpdate: SettingsUpdate, errorMessage: Ref<string>) {
    let isValid =
      settingsUpdate.range != Range.COUNT ||
      (this.checkOrder(
        settingsUpdate.lowerCount,
        settingsUpdate.upperCount,
        errorMessage,
      ) &&
        this.checkLowerBound(settingsUpdate.upperCount, 1, "1", errorMessage) &&
        this.checkUpperBound(
          settingsUpdate.lowerCount,
          this.matchCount,
          this.matchCount.toString(),
          errorMessage,
        ));

    isValid =
      isValid &&
      (settingsUpdate.range != Range.ID ||
        (this.checkOrder(
          settingsUpdate.lowerId,
          settingsUpdate.upperId,
          errorMessage,
        ) &&
          this.checkLowerBound(
            settingsUpdate.upperId,
            this.minId,
            this.minId.toString(),
            errorMessage,
          ) &&
          this.checkUpperBound(
            settingsUpdate.lowerId,
            this.maxId,
            this.maxId.toString(),
            errorMessage,
          )));

    return (
      isValid &&
      (settingsUpdate.range != Range.DATE ||
        (this.checkOrder(
          settingsUpdate.lowerDate,
          settingsUpdate.upperDate,
          errorMessage,
        ) &&
          this.checkLowerBound(
            settingsUpdate.upperDate,
            this.minDate,
            htmlFormatDate(this.minDate),
            errorMessage,
          ) &&
          this.checkUpperBound(
            settingsUpdate.lowerDate,
            this.maxDate,
            htmlFormatDate(this.maxDate),
            errorMessage,
          )))
    );
  }

  getStartDate(): string {
    return htmlFormatDate(this.lowerDate);
  }

  getEndDate(): string {
    return htmlFormatDate(this.upperDate);
  }

  isInRange(match: Match, index: number): boolean {
    switch (this.range) {
      case Range.COUNT:
        return this.isInRangeInt(this.lowerCount, this.upperCount, index);
      case Range.ID:
        return this.isInRangeInt(this.lowerId, this.upperId, match.id);
      case Range.DATE:
        return this.isInRangeInt(
          this.lowerDate,
          this.upperDate,
          match.dateTime,
        );
      default:
        return false;
    }
  }

  buildSettingsUpdate(): SettingsUpdate {
    return new SettingsUpdate(
      this.lowerCount,
      this.upperCount,
      this.lowerId,
      this.upperId,
      this.lowerDate,
      this.upperDate,
      this.windowSize,
      this.aggregation,
      this.range,
    );
  }

  private isInRangeInt<T>(lower: T, upper: T, value: T) {
    return lower <= value && upper >= value;
  }

  private checkOrder<T>(from: T, to: T, errorMessage: Ref<string>): boolean {
    if (from > to) {
      errorMessage.value = '"From" must not be larger than "to"';
      return false;
    }
    return true;
  }

  private checkLowerBound<T>(
    from: T,
    minFrom: T,
    limit: string,
    errorMessage: Ref<string>,
  ): boolean {
    if (minFrom > from) {
      errorMessage.value = '"To" must not be smaller than ' + limit;
      return false;
    }

    return true;
  }

  private checkUpperBound<T>(
    to: T,
    maxTo: T,
    limit: string,
    errorMessage: Ref<string>,
  ): boolean {
    if (maxTo < to) {
      errorMessage.value = '"From" must not be larger than ' + limit;
      return false;
    }

    return true;
  }
}

export class SettingsUpdate {
  lowerCount: number;
  upperCount: number;
  lowerId: number;
  upperId: number;
  lowerDate: Date;
  upperDate: Date;
  windowSize: number;
  aggregation: Aggregation;
  range: Range;

  constructor(
    lowerCount: number,
    upperCount: number,
    lowerId: number,
    upperId: number,
    lowerDate: Date,
    upperDate: Date,
    windowUpdate: number,
    aggregationUpdate: Aggregation,
    rangeUpdate: Range,
  ) {
    this.lowerCount = lowerCount;
    this.upperCount = upperCount;
    this.lowerId = lowerId;
    this.upperId = upperId;
    this.lowerDate = lowerDate;
    this.upperDate = upperDate;
    this.windowSize = windowUpdate;
    this.aggregation = aggregationUpdate;
    this.range = rangeUpdate;
  }
}

export function createEndOfDayDate(date: Date) {
  const maxDate = new Date(date);
  maxDate.setUTCHours(23);
  maxDate.setUTCMinutes(59);
  maxDate.setUTCSeconds(59);
  maxDate.setUTCMilliseconds(999);
  return maxDate;
}

export function createStartOfDayDate(date: Date) {
  const minDate = new Date(date);
  minDate.setUTCHours(0);
  minDate.setUTCMinutes(0);
  minDate.setUTCSeconds(0);
  minDate.setUTCMilliseconds(0);
  return minDate;
}

export function htmlFormatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export enum Range {
  COUNT,
  ID,
  DATE,
}

export enum Aggregation {
  SUM,
  WINDOW,
}
