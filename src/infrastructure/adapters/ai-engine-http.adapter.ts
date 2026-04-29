import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { AIEngineDispatchRequest } from '../../domain/entities';
import type { AIEnginePort, AIEngineRelayResponse } from '../../domain/ports';
import { AI_ENGINE_CONFIG } from '../config';
import type { AIEngineConfig } from '../config';

@Injectable()
export class AIEngineHttpAdapter implements AIEnginePort {
  constructor(
    private readonly httpService: HttpService,
    @Inject(AI_ENGINE_CONFIG)
    private readonly aiEngineConfig: AIEngineConfig,
  ) {}

  async dispatchMessage(
    request: AIEngineDispatchRequest,
  ): Promise<AIEngineRelayResponse> {
    const internalSecret = this.aiEngineConfig.internalSecret;
    if (!internalSecret) {
      throw new Error('AI_ENGINE_INTERNAL_SECRET is not configured.');
    }

    const endpoint = `${this.aiEngineConfig.baseUrl.replace(/\/+$/, '')}/internal/v1/chat/message`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<AIEngineRelayResponse>(
          endpoint,
          {
            requestId: request.requestId,
            text: request.text,
            audio: request.audioPayload,
          },
          {
            headers: {
              'X-Internal-Secret': internalSecret,
            },
          },
        ),
      );

      return response.data;
    } catch {
      throw new Error('AI engine relay failed.');
    }
  }
}
