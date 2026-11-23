import { AggregateRoot } from '@building-blocks/domain';

export abstract class EventSourcedAggregate extends AggregateRoot {
  private _version = -1;
  private _uncommitted: object[] = [];
  get version() { return this._version; }
  get uncommittedEvents() { return [...this._uncommitted]; }
  clearUncommittedEvents() { this._uncommitted = []; }
  protected apply(event: object, isNew = true) {
    const applier = (this as any)[`apply${event.constructor.name}`];
    if (typeof applier === 'function') applier.call(this, event);
    if (isNew) this._uncommitted.push(event);
    else this._version += 1;
  }
  loadFromHistory(events: object[]) {
    for (const event of events) this.apply(event, false);
  }
}
