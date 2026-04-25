import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AI_ENGINE_PORT } from '../src/domain/ports';

describe('Chat message route (e2e)', () => {
  let app: INestApplication;
  let appUrl: string;
  const originalEnv = {
    FRONTEND_ALLOWED_ORIGINS: process.env.FRONTEND_ALLOWED_ORIGINS,
    AI_ENGINE_INTERNAL_SECRET: process.env.AI_ENGINE_INTERNAL_SECRET,
    AI_ENGINE_URL: process.env.AI_ENGINE_URL,
  };

  const dispatchMessage = jest.fn();

  beforeEach(async () => {
    process.env.FRONTEND_ALLOWED_ORIGINS = 'http://allowed.test';
    process.env.AI_ENGINE_INTERNAL_SECRET = 'server-internal-secret';
    process.env.AI_ENGINE_URL = 'http://ai-engine.test';

    dispatchMessage.mockReset();
    dispatchMessage.mockResolvedValue({
      status: 'accepted',
      requestId: 'req_1',
      output: {},
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AI_ENGINE_PORT)
      .useValue({
        dispatchMessage,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    await app.listen(0);
    appUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
    process.env.FRONTEND_ALLOWED_ORIGINS = originalEnv.FRONTEND_ALLOWED_ORIGINS;
    process.env.AI_ENGINE_INTERNAL_SECRET =
      originalEnv.AI_ENGINE_INTERNAL_SECRET;
    process.env.AI_ENGINE_URL = originalEnv.AI_ENGINE_URL;
  });

  it('accepts text-only payload', async () => {
    const response = await fetch(`${appUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://allowed.test',
      },
      body: JSON.stringify({ text: 'hello' }),
    });
    const body = (await response.json()) as {
      status: string;
      correlationId: string;
      message: string;
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe('accepted');
    expect(body.correlationId).toEqual(expect.any(String));
    expect(dispatchMessage).toHaveBeenCalledTimes(1);
  });

  it('accepts audio-only payload', async () => {
    const formData = new FormData();
    formData.append(
      'audio',
      new Blob(['abc'], { type: 'audio/wav' }),
      'voice.wav',
    );

    const response = await fetch(`${appUrl}/chat/message`, {
      method: 'POST',
      headers: {
        origin: 'http://allowed.test',
      },
      body: formData,
    });

    expect(response.status).toBe(200);
    expect(dispatchMessage).toHaveBeenCalledTimes(1);
  });

  it('accepts payload with text and audio', async () => {
    const formData = new FormData();
    formData.append('text', 'hello');
    formData.append(
      'audio',
      new Blob(['abc'], { type: 'audio/wav' }),
      'voice.wav',
    );

    const response = await fetch(`${appUrl}/chat/message`, {
      method: 'POST',
      headers: {
        origin: 'http://allowed.test',
      },
      body: formData,
    });

    expect(response.status).toBe(200);
    expect(dispatchMessage).toHaveBeenCalledTimes(1);
  });

  it('rejects request without text and audio', async () => {
    const response = await fetch(`${appUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://allowed.test',
      },
      body: JSON.stringify({}),
    });
    const body = (await response.json()) as {
      status: string;
      reason: string;
    };

    expect(response.status).toBe(400);
    expect(body.status).toBe('rejected');
    expect(body.reason).toBe('Message must contain text, audio, or both.');
    expect(dispatchMessage).not.toHaveBeenCalled();
  });

  it('blocks request from disallowed origin', async () => {
    const response = await fetch(`${appUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://evil.test',
      },
      body: JSON.stringify({ text: 'hello' }),
    });
    const body = (await response.json()) as {
      status: string;
      reason: string;
    };

    expect(response.status).toBe(403);
    expect(body).toEqual({
      status: 'blocked',
      reason: 'Origin is not allowed.',
    });
    expect(dispatchMessage).not.toHaveBeenCalled();
  });

  it('blocks request after exceeding throttling limit', async () => {
    const requests = Array.from({ length: 11 }, () =>
      fetch(`${appUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://allowed.test',
        },
        body: JSON.stringify({ text: 'hello' }),
      }),
    );

    const responses = await Promise.all(requests);
    const statusCodes = responses.map((response) => response.status);

    expect(statusCodes).toContain(429);
  });

  it('returns failed when relay to AI engine is unavailable', async () => {
    dispatchMessage.mockRejectedValueOnce(new Error('relay down'));

    const response = await fetch(`${appUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://allowed.test',
      },
      body: JSON.stringify({ text: 'hello' }),
    });
    const body = (await response.json()) as {
      status: string;
      reason: string;
    };

    expect(response.status).toBe(502);
    expect(body).toEqual({
      status: 'failed',
      reason: 'Failed to process message with AI Engine.',
    });
  });
});
