import CategoryBase from "./CategoryBase";

export default class Clickhouse extends CategoryBase {
  protected categoryPath = "clickhouse";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public dashboardData(range: "30d" | "30w" | "30m" | "30q" | "all") {
    return this.get(this.categoryPath, "dashboardData/" + range).then(
      (res) => res.data,
    );
  }

  public competitiveResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ) {
    return this.post(
      this.categoryPath,
      "competitiveResults/" + range,
      opts,
    ).then((res) => res.data);
  }

  public rosterResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ) {
    return this.post(this.categoryPath, "rosterResults/" + range, opts).then(
      (res) => res.data,
    );
  }

  public skillSelection(roster: String | null, position: String | null) {
    const opts: any = {
      roster: roster,
      position: position,
    };

    return this.post(this.categoryPath, `skillSelection`, opts).then(
      (res) => res.data,
    );
  }

  public versusStats(
    year = null,
    month = null,
    type = "All",
    includeLegacy = false,
  ) {
    const opts: any = {
      year: year != "All" ? year : null,
      month: month != "All" ? month : null,
      type: type,
      includeLegacy: includeLegacy,
    };

    return this.post(this.categoryPath, "versusStats", opts).then(
      (res) => res.data,
    );
  }

  public matchupData(
    roster1: string,
    roster2: string,
    year = null,
    month = null,
    type = "All",
    includeLegacy = false,
  ) {
    const opts: any = {
      year: year != "All" ? year : null,
      month: month != "All" ? month : null,
      type: type,
      includeLegacy: includeLegacy,
    };

    return this.post(this.categoryPath, "matchupData", {
      roster1: roster1,
      roster2: roster2,
      ...opts,
    }).then((res) => res.data);
  }

  public topList(stat, type, division, roster, position) {
    const opts: any = {
      stat: stat,
      type: type,
      division: division,
      roster: roster,
      position: position,
    };
    return this.post(this.categoryPath, "topList", opts).then(
      (res) => res.data,
    );
  }
}
