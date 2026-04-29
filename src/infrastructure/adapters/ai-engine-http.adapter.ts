import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { AIEngineDispatchRequest } from '../../domain/entities';
import type { AIEnginePort, AIEngineRelayResponse } from '../../domain/ports';
import { AI_ENGINE_CONFIG } from '../config';
import type { AIEngineConfig } from '../config';

type AIEngineChatProcessResponse = Record<string, unknown> & {
  metadata?: {
    request_id?: string;
  };
};

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

    const endpoint = `${this.aiEngineConfig.baseUrl.replace(/\/+$/, '')}/api/v1/chat/process`;
    const formData = this.toChatProcessFormData(request);

    try {
      const response = await firstValueFrom(
        this.httpService.post<AIEngineChatProcessResponse>(endpoint, formData, {
          headers: {
            'X-Internal-Secret': internalSecret,
          },
        }),
      );

      return {
        status: 'completed',
        requestId: response.data.metadata?.request_id ?? request.requestId,
        output: response.data,
      };
    } catch {
      throw new Error('AI engine relay failed.');
    }
  }

  private toChatProcessFormData(request: AIEngineDispatchRequest): FormData {
    const formData = new FormData();

    if (request.text) {
      formData.append('text', request.text);
    }

    if (request.audioPayload) {
      const audioBytes = Buffer.from(
        request.audioPayload.contentBase64,
        'base64',
      );
      const audioBlob = new Blob([audioBytes], {
        type: request.audioPayload.mediaType,
      });

      formData.append('audio', audioBlob, request.audioPayload.fileName);
    }

    return formData;
  }
}
