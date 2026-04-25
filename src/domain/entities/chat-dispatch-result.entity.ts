export type ChatDispatchStatus = 'accepted' | 'blocked' | 'rejected' | 'failed';

export class ChatDispatchResult {
  constructor(
    public readonly status: ChatDispatchStatus,
    public readonly correlationId?: string,
    public readonly message?: string,
    public readonly reason?: string,
    public readonly engineResponse?: Record<string, unknown>,
  ) {}
}
