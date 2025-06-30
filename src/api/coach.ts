import CategoryBase from "./CategoryBase";

export default class Coach extends CategoryBase {
  protected categoryPath = "coach";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public teams(coach: string) {
    return this.get(this.categoryPath, "teams/" + coach).then(
      (res) => res.data,
    );
  }

  public activeTeams(coach: string) {
    return this.get(this.categoryPath, "activeteams/" + coach).then(
      (res) => res.data,
    );
  }
}
