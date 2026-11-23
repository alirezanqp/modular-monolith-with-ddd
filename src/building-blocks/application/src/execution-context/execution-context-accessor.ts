export interface IExecutionContextAccessor {
  readonly userId: string;
  readonly correlationId: string;
  readonly isAvailable: boolean;
}

export class ExecutionContextAccessor implements IExecutionContextAccessor {
  constructor(
    private readonly _userId: string | null,
    private readonly _correlationId: string,
  ) {}

  get userId(): string {
    if (!this._userId) {
      throw new Error('User id is not available in the current execution context');
    }
    return this._userId;
  }

  get correlationId(): string {
    return this._correlationId;
  }

  get isAvailable(): boolean {
    return this._userId !== null;
  }
}
