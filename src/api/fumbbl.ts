import axios from "axios";

type ApiCall<T> = () => Promise<T>;
interface SerializedApiRunnerOptions {
  maxRetries?: number;
  rateLimitMs?: number;
}

class SerializedApiRunner {
  private queue: Array<() => Promise<void>> = [];
  private running = false;
  private maxRequests: number;
  private windowMs: number;
  private requestTimestamps: number[] = [];

  constructor(options: SerializedApiRunnerOptions = {}) {
    // Default: 5 requests per 1000ms
    this.maxRequests = options.maxRequests ?? 5;
    this.windowMs = options.windowMs ?? 1000;
  }

  public async run<T>(apiCall: ApiCall<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await this.ensureRateLimit();
          const result = await apiCall();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.running || this.queue.length === 0) return;
    this.running = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }
    this.running = false;
  }

  private async ensureRateLimit() {
    const now = Date.now();
    // Remove timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.windowMs,
    );
    if (this.requestTimestamps.length >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.requestTimestamps[0]);
      await this.delay(waitTime);
      // After waiting, clean up again
      return this.ensureRateLimit();
    }
    this.requestTimestamps.push(Date.now());
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

abstract class CategoryBase {
  protected runner: SerializedApiRunner;
  protected abstract categoryPath: string;
  protected apiBase = "";

  private enableOauth: boolean = false;
  private accessToken: string = "";
  private tokenExpiry: number = 0;

  constructor(runner: SerializedApiRunner) {
    const siteUrl = import.meta.env.VITE_API_URL || "https://fumbbl.com";
    this.apiBase = siteUrl + "/api";

    if (import.meta.env.VITE_ENABLE_OAUTH == "true") {
      this.enableOauth = true;
    } else {
      this.enableOauth = false;
    }
    this.runner = runner;
    return new Proxy(this, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        // Only wrap public methods (not constructor, not starting with _)
        if (
          typeof value === "function" &&
          prop !== "constructor" &&
          typeof prop === "string" &&
          !prop.startsWith("_")
        ) {
          return (...args: any[]) =>
            runner.run(() => value.apply(target, args));
        }
        return value;
      },
    });
  }

  protected async getAccessToken(): Promise<string> {
    if (Date.now() > this.tokenExpiry) {
      const data = {
        grant_type: "client_credentials",
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
      };
      this.enableOauth = false;
      const result = await this.post("oauth", "token", data);
      this.enableOauth = true;
      const tokenData = result.data;

      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000 - 10;
      this.accessToken = tokenData.access_token;
    }
    return this.accessToken;
  }

  protected async getAuthHeaders(): Promise<string | undefined> {
    let headers = {};
    if (this.enableOauth) {
      const token = await this.getAccessToken();
      headers = { headers: { Authorization: "Bearer " + token } };
    }
    return headers;
  }

  protected async get<T>(category: string, endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    return axios.get(`${this.apiBase}/${category}/${endpoint}`, headers);
  }

  protected async post<T>(
    category: string,
    endpoint: string,
    data: any,
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    return axios.post(`${this.apiBase}/${category}/${endpoint}`, data, headers);
  }
}

class Coach extends CategoryBase {
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

class Clickhouse extends CategoryBase {
  protected categoryPath = "clickhouse";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public dashboardData(range: "30d" | "30w" | "30m" | "30q" | "all") {
    return this.get(this.categoryPath, "dashboardData/" + range).then(
      (res) => res.data,
    );
  }

  public competitiveResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ) {
    return this.post(
      this.categoryPath,
      "competitiveResults/" + range,
      opts,
    ).then((res) => res.data);
  }

  public rosterResults(
    range: "30d" | "30w" | "30m" | "30q" | "all",
    opts: any = {},
  ) {
    return this.post(this.categoryPath, "rosterResults/" + range, opts).then(
      (res) => res.data,
    );
  }

  public skillSelection(roster: String | null, position: String | null) {
    const opts: any = {
      roster: roster,
      position: position,
    };

    return this.post(this.categoryPath, `skillSelection`, opts).then(
      (res) => res.data,
    );
  }
}

class TournamentSquads extends CategoryBase {
  protected categoryPath = "tournamentsquads";

  constructor(runner: SerializedApiRunner) {
    super(runner);
  }

  public list() {
    return this.get(this.categoryPath, "list").then((res) => res.data);
  }

  public create(data: {
    name: string;
    maxMembers: number;
    maxReserves: number;
  }) {
    return this.post(this.categoryPath, "create", data).then((res) => res.data);
  }

  public disband(id: number) {
    return this.post(this.categoryPath, "disband", { squadId: id }).then(
      (res) => res.data,
    );
  }

  public getPendingRequests() {
    return this.post(this.categoryPath, "pendingRequests").then(
      (res) => res.data,
    );
  }

  public removeMember(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "remove", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public cancelRequest(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "cancelRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public sendJoinRequest(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "joinRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public search(query: string) {
    return this.get(
      this.categoryPath,
      "search/" + encodeURIComponent(query),
    ).then((res) => res.data);
  }

  public acceptRequestMember(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: false,
    }).then((res) => res.data);
  }

  public acceptRequestReserve(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "acceptRequest", {
      squadId: squadId,
      teamId: teamId,
      isReserve: true,
    }).then((res) => res.data);
  }

  public declineRequest(squadId: number, teamId: number) {
    return this.post(this.categoryPath, "rejectRequest", {
      squadId: squadId,
      teamId: teamId,
    }).then((res) => res.data);
  }

  public swapTeam(squadId: number, teamId: number, otherTeamId: number | null) {
    return this.post(this.categoryPath, "swapTeam", {
      squadId: squadId,
      teamId: teamId,
      otherTeamId: otherTeamId,
    }).then((res) => res.data);
  }

  public rename(squadId: number, newName: string) {
    return this.post(this.categoryPath, "rename", {
      squadId: squadId,
      name: newName,
    }).then((res) => res.data);
  }
}

export default class FumbblApi {
  public TournamentSquads: TournamentSquads;
  public Coach: Coach;
  public Clickhouse: Clickhouse;

  private runner: SerializedApiRunner;

  constructor() {
    this.runner = new SerializedApiRunner();
    this.TournamentSquads = new TournamentSquads(this.runner);
    this.Coach = new Coach(this.runner);
    this.Clickhouse = new Clickhouse(this.runner);
  }
}
