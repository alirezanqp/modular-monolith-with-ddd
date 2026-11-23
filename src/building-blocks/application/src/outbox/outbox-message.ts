export interface OutboxMessage {
  id: string;
  occurredOn: Date;
  type: string;
  data: string;
  processedDate: Date | null;
}
