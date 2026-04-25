import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadAIEngineConfig, isOriginAllowed } from './infrastructure/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const aiConfig = loadAIEngineConfig();

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, false);
        return;
      }

      if (isOriginAllowed(origin, aiConfig.allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  });

  const port = Number(process.env.PORT ?? '3000');

  await app.listen(port);
}
void bootstrap();
