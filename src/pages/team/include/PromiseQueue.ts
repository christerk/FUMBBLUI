export default class PromiseQueue {
  private queue: Promise<any>;

  constructor() {
    this.queue = Promise.resolve(true);
  }

  public async add(operation: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(operation).then(resolve).catch(reject);
    });
  }

  public async run(operation: any) {
    await operation();
  }
}
