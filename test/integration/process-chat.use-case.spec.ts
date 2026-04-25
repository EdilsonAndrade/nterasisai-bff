import { ProcessChatUseCase } from '../../src/application/use-cases';
import { AIEngineDispatchRequest } from '../../src/domain/entities';
import { AIEnginePort } from '../../src/domain/ports';

describe('ProcessChatUseCase', () => {
  const buildPort = (): jest.Mocked<AIEnginePort> => ({
    dispatchMessage: jest.fn(),
  });

  it('normalizes payload and dispatches to AI Engine', async () => {
    const port = buildPort();
    port.dispatchMessage.mockResolvedValue({
      status: 'accepted',
      requestId: 'req_1',
      output: {},
    });

    const useCase = new ProcessChatUseCase(port);
    const result = await useCase.execute({
      text: 'hello world',
      audioFile: {
        fileName: 'voice.wav',
        mediaType: 'audio/wav',
        bytes: Buffer.from('abc'),
      },
      origin: 'http://allowed.test',
      internalSecret: 'malicious-client-secret',
    });

    expect(result.status).toBe('accepted');
    expect(result.correlationId).toBeDefined();
    expect(port.dispatchMessage).toHaveBeenCalledTimes(1);

    const requestArg = port.dispatchMessage.mock.calls[0][0];
    expect(requestArg.text).toBe('hello world');
    expect(requestArg.audioPayload?.fileName).toBe('voice.wav');
    expect(JSON.stringify(requestArg)).not.toContain('malicious-client-secret');
  });

  it('rejects message when both text and audio are missing', async () => {
    const port = buildPort();
    const useCase = new ProcessChatUseCase(port);

    const result = await useCase.execute({
      text: '   ',
      origin: 'http://allowed.test',
    });

    expect(result.status).toBe('rejected');
    expect(result.reason).toBe('Message must contain text, audio, or both.');
    expect(port.dispatchMessage).not.toHaveBeenCalled();
  });

  it('returns failed when AI Engine relay throws', async () => {
    const port = buildPort();
    port.dispatchMessage.mockRejectedValue(new Error('relay down'));

    const useCase = new ProcessChatUseCase(port);
    const result = await useCase.execute({
      text: 'hello',
      origin: 'http://allowed.test',
      internalSecret: 'client-secret',
    });

    expect(result.status).toBe('failed');
    expect(result.reason).toBe('Failed to process message with AI Engine.');
  });
});
