import CategoryBase from "./categoryBase";
import SerializedApiRunner from "./serializedApiRunner";

export default class Clickhouse extends CategoryBase {
  protected categoryPath = "clickhouse";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public async dashboardData(
    range: "30d" | "30w" | "30m" | "30q" | "all",
  ): Promise<any> {
    return this.get(this.categoryPath, "dashboardData/" + range).then(
      (res: any) => res.data,
    );
  }

  public async competitiveResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ): Promise<any> {
    return this.post(
      this.categoryPath,
      "competitiveResults/" + range,
      opts,
    ).then((res: any) => res.data);
  }

  public async rosterResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ): Promise<any> {
    return this.post(this.categoryPath, "rosterResults/" + range, opts).then(
      (res: any) => res.data,
    );
  }

  public async skillSelection(
    roster: String | null,
    position: String | null,
  ): Promise<any> {
    const opts: any = {
      roster: roster,
      position: position,
    };

    return this.post(this.categoryPath, `skillSelection`, opts).then(
      (res: any) => res.data,
    );
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

    return this.post(this.categoryPath, "versusStats", opts).then(
      (res: any) => res.data,
    );
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
    }).then((res: any) => res.data);
  }

  public async topList(
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
    return this.post(this.categoryPath, "topList", opts).then(
      (res: any) => res.data,
    );
  }
}
