import axios from "axios";
import SerializedApiRunner from "./serializedApiRunner";

export default abstract class CategoryBase {
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
  }

  protected async getAccessToken(): Promise<string> {
    if (Date.now() > this.tokenExpiry) {
      const data = {
        grant_type: "client_credentials",
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
      };
      this.enableOauth = false;
      const result: any = await this.post("oauth", "token", data);
      this.enableOauth = true;
      const tokenData = result.data;

      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000 - 100;
      this.accessToken = tokenData.access_token;
    }
    return this.accessToken;
  }

  protected async getAuthHeaders(): Promise<string | undefined> {
    let headers: any = {};
    if (this.enableOauth) {
      const token = await this.getAccessToken();
      headers = { headers: { Authorization: "Bearer " + token } };
    }
    return headers;
  }

  protected async get<T>(category: string, endpoint: string): Promise<T> {
    const headers: any = await this.getAuthHeaders();
    return this.runner.run(() =>
      axios.get(`${this.apiBase}/${category}/${endpoint}`, headers),
    );
  }

  protected async post<T>(
    category: string,
    endpoint: string,
    data: any | null = null,
  ): Promise<T> {
    const headers: any = await this.getAuthHeaders();
    return this.runner.run(() =>
      axios.post(`${this.apiBase}/${category}/${endpoint}`, data, headers),
    );
  }
}
