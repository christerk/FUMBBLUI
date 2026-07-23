import QueuedApiRunner from "./queuedApiRunner";
import AuthProvider from "./authProvider";
import ApiClient from "./apiClient";

import Coach from "./coach";
import Roster from "./roster";
import Clickhouse from "./clickhouse";
import TournamentSquads from "./tournamentSquads";
import Skill from "./skill";
import Ruleset from "./ruleset";

export default class FumbblApi {
  public TournamentSquads: TournamentSquads;
  public Coach: Coach;
  public Clickhouse: Clickhouse;
  public Roster: Roster;
  public Skill: Skill;
  public Ruleset: Ruleset;

  private runner: QueuedApiRunner;
  private auth: AuthProvider;
  private client: ApiClient;

  constructor() {
    const siteUrl = import.meta.env.VITE_API_URL || "https://fumbbl.com";

    this.runner = new QueuedApiRunner({ maxRequests: 20 });
    this.auth = new AuthProvider(
      import.meta.env.VITE_CLIENT_ID,
      import.meta.env.VITE_CLIENT_SECRET,
      "https://fumbbl.com/api/oauth/token",
      import.meta.env.VITE_ENABLE_OAUTH === "true",
    );
    this.client = new ApiClient(siteUrl + "/api", this.auth);

    this.TournamentSquads = new TournamentSquads(this.runner, this.client);
    this.Coach = new Coach(this.runner, this.client);
    this.Clickhouse = new Clickhouse(this.runner, this.client);
    this.Roster = new Roster(this.runner, this.client);
    this.Skill = new Skill(this.runner, this.client);
    this.Ruleset = new Ruleset(this.runner, this.client);
  }
}
