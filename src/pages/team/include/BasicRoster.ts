export default class BasicRoster {
  private _id: number;
  private _name: string;
  private _tier: string;
  private _logos: any;

  constructor(id: number, name: string, tier: string, logos: any) {
    this._id = id;
    this._name = name;
    this._tier = tier;
    this._logos = logos;
  }

  public get id() {
    return this._id;
  }

  public get name() {
    return this._name;
  }

  public get tier() {
    return this._tier;
  }

  public getLogoImageId(size: number): number {
    if (!Object.keys(this._logos).includes(size.toString())) {
      console.error(
        `Failed to find logo for roster ${this.id}, logo size ${size}.`,
      );
      return 0;
    }

    return this._logos[size];
  }
}
