import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/main';

describe('Swagger documentation (e2e)', () => {
  let app: INestApplication;
  let appUrl: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
    await app.listen(0);
    appUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('serves the Swagger UI at /api/docs', async () => {
    const response = await fetch(`${appUrl}/api/docs`, {
      redirect: 'follow',
    });

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain('Swagger UI');
  });

  it('exposes the OpenAPI JSON document at /api/docs-json', async () => {
    const response = await fetch(`${appUrl}/api/docs-json`);

    expect(response.status).toBe(200);
    const document = (await response.json()) as Record<string, unknown> & {
      info: { title: string; version: string };
      paths: Record<string, unknown>;
      tags?: { name: string }[];
    };

    expect(document.info.title).toBe('Interasis AI - BFF API');
    expect(document.info.version).toBe('1.0.0');
    expect(document.paths['/health']).toBeDefined();
    expect(document.paths['/chat/message']).toBeDefined();

    const tagNames = (document.tags ?? []).map((tag) => tag.name);
    expect(tagNames).toEqual(expect.arrayContaining(['Health', 'Chat']));
  });
});
