import axios from "axios";

export default class AuthProvider {
  private accessToken = "";
  private tokenExpiry = 0;

  private readonly enabled: boolean;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly tokenUrl: string,
    enableOauth: boolean,
  ) {
    this.enabled = enableOauth;
  }

  public async getHeaders(): Promise<Record<string, string>> {
    if (!this.enabled) {
      return {};
    }

    const token = await this.getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  private async getToken(): Promise<string> {
    if (Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await axios.post(this.tokenUrl, {
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const data = response.data;

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + data.expires_in * 1000 - 100;

    return this.accessToken;
  }
}
