import CategoryBase from "./categoryBase";

export default class Coach extends CategoryBase {
  protected readonly categoryPath = "coach";

  public teams(coach: string): Promise<any> {
    return this.get(this.categoryPath, "teams/" + coach);
  }

  public activeTeams(coach: string) {
    return this.get(this.categoryPath, "activeteams/" + coach);
  }

  public search(str: string) {
    return this.get(this.categoryPath, "search/" + str);
  }
}
