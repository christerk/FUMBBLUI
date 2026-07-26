import CategoryBase from "./categoryBase";

export default class Roster extends CategoryBase {
  protected readonly categoryPath = "roster";

  public list(ruleset: number): Promise<any> {
    return this.get(this.categoryPath, "list/" + ruleset);
  }

  public getRoster(rosterId: number): Promise<any> {
    return this.get(this.categoryPath, "get/" + rosterId);
  }

  public add(rulesetId: number, rosterId: number): Promise<any> {
    const opts: any = {
      ruleset: rulesetId,
      roster: rosterId,
    };

    return this.post(this.categoryPath, "add", opts);
  }

  public remove(rulesetId: number, rosterId: number): Promise<any> {
    const opts: any = {
      ruleset: rulesetId,
      roster: rosterId,
    };

    return this.post(this.categoryPath, "remove", opts);
  }

  public cloneLocal(rulesetId: number, rosterId: number): Promise<any> {
    const opts: any = {
      ruleset: rulesetId,
      roster: rosterId,
    };

    return this.post(this.categoryPath, "cloneLocal", opts);
  }

  public search(query: string, version: string | null = null): Promise<any> {
    console.log(version);
    const opts: any = {
      search: query,
      version: version,
    };
    return this.post(this.categoryPath, "search", opts);
  }
}
