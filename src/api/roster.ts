import CategoryBase from "./CategoryBase";

export default class Roster extends CategoryBase {
  protected categoryPath = "roster";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public list(ruleset: number) {
    return this.get(this.categoryPath, "list/" + ruleset).then(
      (res) => res.data,
    );
  }

  public getRoster(rosterId: number) {
    return this.get(this.categoryPath, "get/" + rosterId).then(
      (res) => res.data,
    );
  }
}
