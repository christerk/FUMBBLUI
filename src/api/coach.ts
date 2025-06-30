import CategoryBase from "./categoryBase";
import SerializedApiRunner from "./serializedApiRunner";

export default class Coach extends CategoryBase {
  protected categoryPath = "coach";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public async teams(coach: string): Promise<any> {
    return this.get(this.categoryPath, "teams/" + coach).then(
      (res: any) => res.data,
    );
  }

  public async activeTeams(coach: string) {
    return this.get(this.categoryPath, "activeteams/" + coach).then(
      (res: any) => res.data,
    );
  }
}
