import SerializedApiRunner from "./SerializedApiRunner";

import Coach from "./Coach";
import Roster from "./Roster";
import Clickhouse from "./Clickhouse";
import TournamentSquads from "./TournamentSquads";

type ApiCall<T> = () => Promise<T>;
interface SerializedApiRunnerOptions {
  maxRetries?: number;
  rateLimitMs?: number;
}

export default class FumbblApi {
  public TournamentSquads: TournamentSquads;
  public Coach: Coach;
  public Clickhouse: Clickhouse;
  public Roster: Roster;

  private _runner: SerializedApiRunner;

  constructor() {
    this._runner = new SerializedApiRunner();
    this.TournamentSquads = new TournamentSquads(this.runner);
    this.Coach = new Coach(this.runner);
    this.Clickhouse = new Clickhouse(this.runner);
    this.Roster = new Roster(this.runner);
  }
}
