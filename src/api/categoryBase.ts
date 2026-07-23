import QueuedApiRunner from "./serializedApiRunner";
import ApiClient from "./apiClient";

export default abstract class CategoryBase {
  protected runner: QueuedApiRunner;
  protected client: ApiClient;

  protected abstract readonly categoryPath: string;
  protected readonly apiBase: string = "";

  constructor(runner: QueuedApiRunner, client: ApiClient) {
    const siteUrl = import.meta.env.VITE_API_URL || "https://fumbbl.com";
    this.apiBase = siteUrl + "/api";

    this.runner = runner;
    this.client = client;
  }

  protected get<T>(category: string, endpoint: string): Promise<T> {
    return this.runner.run(() =>
      this.client.get<T>(`${category}/${endpoint}?v=${Date.now()}`),
    );
  }

  protected post<T>(
    category: string,
    endpoint: string,
    data?: unknown,
  ): Promise<T> {
    return this.runner.run(() =>
      this.client.post<T>(`${category}/${endpoint}`, data),
    );
  }
}
