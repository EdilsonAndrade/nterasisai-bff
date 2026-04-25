import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

describe('App bootstrap (e2e)', () => {
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

  it('initializes the Nest application without startup errors', () => {
    expect(app.getHttpServer()).toBeDefined();
  });

  it('returns 404 for the root route before feature endpoints are registered', () => {
    return fetch(`${appUrl}/`).then((response) => {
      expect(response.status).toBe(404);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
