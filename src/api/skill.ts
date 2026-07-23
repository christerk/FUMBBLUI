import CategoryBase from "./categoryBase";

export default class Skill extends CategoryBase {
  protected readonly categoryPath = "skill";

  public getCategories(rulesVersion: string): Promise<any[]> {
    return this.get(this.categoryPath, "categories/" + rulesVersion);
  }

  public list(year: number): Promise<any[]> {
    return this.get(this.categoryPath, "list/" + year);
  }
}
