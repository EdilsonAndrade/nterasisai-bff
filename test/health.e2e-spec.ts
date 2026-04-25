import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication;
  let appUrl: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0);
    appUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns service status and a dynamic timestamp on GET /health', async () => {
    const response = await fetch(`${appUrl}/health`);
    const body = JSON.parse(await response.text()) as {
      status: string;
      timestamp: string;
    };

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: 'Interasis Server Online',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      timestamp: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
