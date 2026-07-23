import CategoryBase from "./categoryBase";

export default class Clickhouse extends CategoryBase {
  protected readonly categoryPath = "clickhouse";

  public async dashboardData(
    range: "30d" | "30w" | "30m" | "30q" | "all",
  ): Promise<any> {
    return this.get(this.categoryPath, "dashboardData/" + range);
  }

  public async competitiveResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ): Promise<any> {
    return this.post(this.categoryPath, "competitiveResults/" + range, opts);
  }

  public async rosterResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ): Promise<any> {
    return this.post(this.categoryPath, "rosterResults/" + range, opts);
  }

  public async ctvProgression(
    roster: string | null,
    type: string | null,
    season: string | null,
  ): Promise<any> {
    const opts: any = {
      roster: roster,
      type: type,
      season: season,
    };
    return this.post(this.categoryPath, "ctvProgression", opts);
  }

  public async skillSelection(
    roster: String | null,
    position: String | null,
  ): Promise<any> {
    const opts: any = {
      roster: roster,
      position: position,
    };

    return this.post(this.categoryPath, `skillSelection`, opts);
  }

  public async versusStats(
    year = null,
    month = null,
    type = "All",
    includeLegacy = false,
  ): Promise<any> {
    const opts: any = {
      year: year != "All" ? year : null,
      month: month != "All" ? month : null,
      type: type,
      includeLegacy: includeLegacy,
    };

    return this.post(this.categoryPath, "versusStats", opts);
  }

  public async matchupData(
    roster1: string,
    roster2: string,
    year = null,
    month = null,
    type = "All",
    includeLegacy = false,
  ): Promise<any> {
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
    });
  }

  public topList(
    stat: String,
    type: String,
    division: String,
    roster: String,
    position: String,
  ): Promise<any> {
    const opts: any = {
      stat: stat,
      type: type,
      division: division,
      roster: roster,
      position: position,
    };
    return this.post(this.categoryPath, "topList", opts);
  }
}
