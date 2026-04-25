import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  AIEngineDispatchRequest,
  ChatDispatchResult,
  UploadedAudioFile,
} from '../../domain/entities';
import { AI_ENGINE_PORT, AIEnginePort } from '../../domain/ports';
import { MessageContent, MessageContentError } from '../../domain/value-objects';
import { ProcessChatResponseDto } from '../dto';

export interface ProcessChatInput {
  text?: string;
  audioFile?: UploadedAudioFile;
  origin?: string;
  internalSecret?: string;
}

@Injectable()
export class ProcessChatUseCase {
  constructor(
    @Inject(AI_ENGINE_PORT)
    private readonly aiEnginePort: AIEnginePort,
  ) {}

  async execute(input: ProcessChatInput): Promise<ProcessChatResponseDto> {
    try {
      const content = MessageContent.create(input.text, input.audioFile);
      const requestId = randomUUID();
      const audioPayload =
        content.audio &&
        {
          fileName: content.audio.fileName,
          mediaType: content.audio.mediaType,
          contentBase64: content.audio.bytes.toString('base64'),
        };

      const dispatchRequest = new AIEngineDispatchRequest(
        requestId,
        content.text,
        audioPayload,
      );
      const engineResponse = await this.aiEnginePort.dispatchMessage(dispatchRequest);

      return this.toResponse(
        new ChatDispatchResult(
          'accepted',
          requestId,
          'Request accepted for processing.',
          undefined,
          engineResponse.output,
        ),
      );
    } catch (error) {
      if (error instanceof MessageContentError) {
        return this.toResponse(
          new ChatDispatchResult('rejected', undefined, undefined, error.message),
        );
      }

      return this.toResponse(
        new ChatDispatchResult(
          'failed',
          undefined,
          undefined,
          'Failed to process message with AI Engine.',
        ),
      );
    }
  }

  private toResponse(result: ChatDispatchResult): ProcessChatResponseDto {
    return {
      status: result.status,
      correlationId: result.correlationId,
      message: result.message,
      reason: result.reason,
    };
  }
}