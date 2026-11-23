import { Logger } from '@nestjs/common';

export class BackgroundProcessor {
  private readonly logger = new Logger(BackgroundProcessor.name);
  private timers: NodeJS.Timeout[] = [];
  private running = false;

  start(jobs: Array<{ name: string; intervalMs: number; work: () => Promise<void> }>): void {
    if (this.running) {
      return;
    }
    this.running = true;

    for (const job of jobs) {
      const timer = setInterval(async () => {
        try {
          await job.work();
        } catch (error) {
          this.logger.error(`Background job ${job.name} failed`, error as Error);
        }
      }, job.intervalMs);
      timer.unref?.();
      this.timers.push(timer);
    }
  }

  stop(): void {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers = [];
    this.running = false;
  }
}
