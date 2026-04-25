import { AIEngineDispatchRequest } from '../entities';

export const AI_ENGINE_PORT = 'AI_ENGINE_PORT';

export interface AIEngineRelayResponse {
  status: 'accepted' | 'completed';
  requestId: string;
  output?: Record<string, unknown>;
}

export interface AIEnginePort {
  dispatchMessage(
    request: AIEngineDispatchRequest,
  ): Promise<AIEngineRelayResponse>;
}
