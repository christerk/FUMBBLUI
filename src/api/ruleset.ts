import CategoryBase from "./categoryBase";

export default class Ruleset extends CategoryBase {
  protected readonly categoryPath = "ruleset";

  public list(): Promise<any> {
    return this.get(this.categoryPath, "list");
  }

  public getRuleset(rulesetId: number): Promise<any> {
    return this.get(this.categoryPath, "get/" + rulesetId);
  }

  public save(rulesetId: number, data: any): Promise<any> {
    const opts: any = {
      options: data,
    };
    return this.post(this.categoryPath, "setoptions/" + rulesetId, opts);
  }

  public promoted(version: any): Promise<any> {
    return this.get(
      this.categoryPath,
      "promoted" + (version ? "/" + version : ""),
    );
  }

  public addManager(rulesetId: number, coachId: number): Promise<any> {
    const opts: any = {
      manager: coachId,
    };

    return this.post(this.categoryPath, "addManager/" + rulesetId, opts);
  }

  public removeManager(rulesetId: number, coachId: number): Promise<any> {
    const opts: any = {
      manager: coachId,
    };

    return this.post(this.categoryPath, "removeManager/" + rulesetId, opts);
  }
}
