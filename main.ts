type PromiseQueueContstuctorArgs<T = unknown> = {
  maxSimultaneous: number;
  onResolve?: (val: T) => void;
};

export class PromiseQueue<T> {
  active: Promise<T>[];
  queue: Promise<T>[];
  onResolve?: (val: T) => void;
  maxSimultaneous: number;

  constructor({ maxSimultaneous, onResolve }: PromiseQueueContstuctorArgs) {
    this.active = [];
    this.queue = [];
    this.maxSimultaneous = maxSimultaneous;
    this.onResolve = onResolve;
  }

  add(p: Promise<T>): void {
    if (this.active.length >= this.maxSimultaneous) {
      this.queue.push(p);
    } else {
      this.active.push(p);
      this.run(p);
    }
  }

  private run(p: Promise<T>): void {
    p.then((val) => {
      this.onResolve?.(val);
    }).finally(() => {
      this.next(p);
    });
  }

  private next(p: Promise<T>): void {
    this.active = this.active.filter((activePromise) => activePromise !== p);

    if (this.queue.length > 0) {
      const nextP = this.queue.shift();

      if (typeof nextP !== "undefined") {
        this.active.push(nextP);
        this.run(nextP);
      }
    }
  }
}
