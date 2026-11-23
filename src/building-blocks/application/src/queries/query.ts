export interface IQuery<TResult> {
  readonly __resultType?: TResult;
}

export abstract class QueryBase<TResult> implements IQuery<TResult> {
  readonly __resultType?: TResult;
}
