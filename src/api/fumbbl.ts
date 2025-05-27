import axios from "axios";

type ApiCall<T> = () => Promise<T>;
interface SerializedApiRunnerOptions {
    maxRetries?: number;
    rateLimitMs?: number;
}

class SerializedApiRunner {
    private queue: Array<() => Promise<void>> = [];
    private running = false;
    private rateLimitMs: number;

    constructor(options: SerializedApiRunnerOptions = {}) {
        this.rateLimitMs = options.rateLimitMs ?? 1000;
    }

    public async run<T>(apiCall: ApiCall<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
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
                await this.delay(this.rateLimitMs);
            }
        }
        this.running = false;
    }

    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

abstract class CategoryBase {
    protected runner: SerializedApiRunner;
    protected abstract categoryPath: string;
    protected static readonly apiBase = import.meta.env.VITE_API_URL + "/api";

    private enableOauth: boolean = import.meta.env.VITE_ENABLE_OAUTH == "true";
    private accessToken: string = "";
    private tokenExpiry: number = 0;


    constructor(runner: SerializedApiRunner) {
        this.enableOauth = 
        this.runner = runner;
        return new Proxy(this, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                // Only wrap public methods (not constructor, not starting with _)
                if (typeof value === "function" && prop !== "constructor" && typeof prop === "string" && !prop.startsWith("_")) {
                    return (...args: any[]) => runner.run(() => value.apply(target, args));
                }
                return value;
            }
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
            headers = { headers: {"Authorization": "Bearer " + token }};
        }
        return headers;
    }

    
    protected async get<T>(category: string, endpoint: string): Promise<T> {
        const headers = await this.getAuthHeaders();
        return axios.get(`${CategoryBase.apiBase}/${category}/${endpoint}`, headers);
    }

    protected async post<T>(category: string, endpoint: string, data: any): Promise<T> {
        const headers = await this.getAuthHeaders();
        return axios.post(`${CategoryBase.apiBase}/${category}/${endpoint}`, data, headers);
    }
}

class TournamentSquads extends CategoryBase {
    protected categoryPath = "tournamentsquads";

    constructor(runner: SerializedApiRunner) {
        super(runner);
    }

    public list() {
        return this.get(this.categoryPath, "list").then(res => res.data);
    }
}

export default class FumbblApi {
    public TournamentSquads: TournamentSquads;

    private runner: SerializedApiRunner;

    constructor() {
        this.runner = new SerializedApiRunner();
        this.TournamentSquads = new TournamentSquads(this.runner);
    }
}
