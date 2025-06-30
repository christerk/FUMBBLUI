type ApiCall<T> = () => Promise<T>;
interface SerializedApiRunnerOptions {
  maxRequests?: number;
  windowMs?: number;
}

export default class SerializedApiRunner {
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

  private async ensureRateLimit(): Promise<void> {
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
