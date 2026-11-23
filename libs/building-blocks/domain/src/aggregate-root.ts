import { Entity } from './entity';

export interface IAggregateRoot {}

export abstract class AggregateRoot extends Entity implements IAggregateRoot {}
