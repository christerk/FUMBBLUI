import axios from "axios";
import AuthProvider from "./authProvider";

export default class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly auth: AuthProvider,
  ) {}

  async get<T>(url: string): Promise<T> {
    const response = await axios.get<T>(`${this.baseUrl}/${url}`, {
      headers: await this.auth.getHeaders(),
    });

    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await axios.post<T>(`${this.baseUrl}/${url}`, data, {
      headers: await this.auth.getHeaders(),
    });

    return response.data;
  }
}
