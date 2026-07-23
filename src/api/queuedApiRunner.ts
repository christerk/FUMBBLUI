type ApiCall<T> = () => Promise<T>;

interface QueuedApiRunnerOptions {
  maxRequests?: number; // rate limit
  windowMs?: number; // rate limit window
  concurrency?: number; // simultaneous requests
}

export default class QueuedApiRunner {
  private queue: Array<() => Promise<void>> = [];
  private activeRequests = 0;

  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly concurrency: number;

  private requestTimestamps: number[] = [];

  constructor(options: QueuedApiRunnerOptions = {}) {
    this.maxRequests = options.maxRequests ?? 5;
    this.windowMs = options.windowMs ?? 1000;
    this.concurrency = options.concurrency ?? 5;
  }

  public run<T>(apiCall: ApiCall<T>): Promise<T> {
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

  private processQueue() {
    while (this.activeRequests < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();

      if (!task) {
        continue;
      }

      this.activeRequests++;

      task().finally(() => {
        this.activeRequests--;
        this.processQueue();
      });
    }
  }

  private async ensureRateLimit(): Promise<void> {
    const now = Date.now();

    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.windowMs,
    );

    if (this.requestTimestamps.length >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.requestTimestamps[0]);

      await this.delay(waitTime);

      return this.ensureRateLimit();
    }

    this.requestTimestamps.push(Date.now());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
