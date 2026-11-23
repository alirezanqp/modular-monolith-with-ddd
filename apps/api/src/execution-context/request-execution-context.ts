import { AsyncLocalStorage } from 'async_hooks';
import { ExecutionContextAccessor } from '@building-blocks/application';

export const executionContextStorage = new AsyncLocalStorage<ExecutionContextAccessor>();

export function getRequestExecutionContext(): ExecutionContextAccessor {
  const ctx = executionContextStorage.getStore();
  if (!ctx) {
    return new ExecutionContextAccessor(null, 'system');
  }
  return ctx;
}
