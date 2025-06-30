import SerializedApiRunner from "./serializedApiRunner";

import Coach from "./coach";
import Roster from "./roster";
import Clickhouse from "./clickhouse";
import TournamentSquads from "./tournamentSquads";

export default class FumbblApi {
  public TournamentSquads: TournamentSquads;
  public Coach: Coach;
  public Clickhouse: Clickhouse;
  public Roster: Roster;

  private _runner: SerializedApiRunner;

  constructor() {
    this._runner = new SerializedApiRunner();
    this.TournamentSquads = new TournamentSquads(this._runner);
    this.Coach = new Coach(this._runner);
    this.Clickhouse = new Clickhouse(this._runner);
    this.Roster = new Roster(this._runner);
  }
}
