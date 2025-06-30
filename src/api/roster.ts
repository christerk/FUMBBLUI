import CategoryBase from "./categoryBase";
import SerializedApiRunner from "./serializedApiRunner";

export default class Roster extends CategoryBase {
  protected categoryPath = "roster";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public async list(ruleset: number): Promise<any> {
    return this.get(this.categoryPath, "list/" + ruleset).then(
      (res: any) => res.data,
    );
  }

  public async getRoster(rosterId: number): Promise<any> {
    return this.get(this.categoryPath, "get/" + rosterId).then(
      (res: any) => res.data,
    );
  }
}
