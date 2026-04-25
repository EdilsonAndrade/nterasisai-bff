import { of, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AIEngineHttpAdapter } from '../../src/infrastructure/adapters';
import { AIEngineDispatchRequest } from '../../src/domain/entities';
import { AIEngineConfig } from '../../src/infrastructure/config';

describe('AIEngineHttpAdapter', () => {
  const buildConfig = (
    partial: Partial<AIEngineConfig> = {},
  ): AIEngineConfig => ({
    baseUrl: 'http://ai-engine.test',
    internalSecret: 'server-internal-secret',
    allowedOrigins: ['http://allowed.test'],
    chatThrottleLimit: 10,
    chatThrottleTtlMs: 60_000,
    ...partial,
  });

  const buildRequest = (): AIEngineDispatchRequest =>
    new AIEngineDispatchRequest('req_1', 'hello', {
      fileName: 'voice.wav',
      mediaType: 'audio/wav',
      contentBase64: Buffer.from('abc').toString('base64'),
    });

  it('adds X-Internal-Secret to relay request', async () => {
    const post = jest.fn().mockReturnValue(
      of({
        data: {
          status: 'accepted',
          requestId: 'req_1',
        },
      }),
    );

    const adapter = new AIEngineHttpAdapter(
      { post } as unknown as HttpService,
      buildConfig(),
    );

    await adapter.dispatchMessage(buildRequest());

    expect(post).toHaveBeenCalledWith(
      'http://ai-engine.test/internal/v1/chat/message',
      expect.objectContaining({
        requestId: 'req_1',
      }),
      expect.objectContaining({
        headers: {
          'X-Internal-Secret': 'server-internal-secret',
        },
      }),
    );
  });

  it('throws when internal secret is not configured', async () => {
    const adapter = new AIEngineHttpAdapter(
      { post: jest.fn() } as unknown as HttpService,
      buildConfig({ internalSecret: '' }),
    );

    await expect(adapter.dispatchMessage(buildRequest())).rejects.toThrow(
      'AI_ENGINE_INTERNAL_SECRET is not configured.',
    );
  });

  it('maps relay failures to a generic adapter error', async () => {
    const post = jest
      .fn()
      .mockReturnValue(throwError(() => new Error('connection refused')));

    const adapter = new AIEngineHttpAdapter(
      { post } as unknown as HttpService,
      buildConfig(),
    );

    await expect(adapter.dispatchMessage(buildRequest())).rejects.toThrow(
      'AI engine relay failed.',
    );
  });
});
