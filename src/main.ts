import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';
import { loadAIEngineConfig, isOriginAllowed } from './infrastructure/config';
import {
  chatJsonRequestExamples,
  chatJsonRequestSchema,
  chatMultipartRequestSchema,
  chatRequestBodyDescription,
} from './presentation/controllers/chat.swagger';

export const SWAGGER_DOCS_PATH = 'api/docs';

function setChatMessageRequestBody(document: OpenAPIObject) {
  const chatMessageOperation = document.paths['/chat/message']?.post;

  if (!chatMessageOperation) {
    return;
  }

  chatMessageOperation.requestBody = {
    required: true,
    description: chatRequestBodyDescription,
    content: {
      'application/json': {
        schema: chatJsonRequestSchema,
        examples: chatJsonRequestExamples,
      },
      'multipart/form-data': {
        schema: chatMultipartRequestSchema,
      },
    },
  };
}

export function setupSwagger(app: Parameters<typeof SwaggerModule.setup>[1]) {
  const config = new DocumentBuilder()
    .setTitle('Interasis AI - BFF API')
    .setDescription(
      'Documentacao da API do BFF Interasis AI. Permite explorar e testar os endpoints de saude e chat de forma independente.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Endpoints de verificacao de disponibilidade do servico.')
    .addTag(
      'Chat',
      'Endpoints de orquestracao de chat multimodal entre frontend e AI Engine.',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  setChatMessageRequestBody(document);
  SwaggerModule.setup(SWAGGER_DOCS_PATH, app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const aiConfig = loadAIEngineConfig();
  const corsOrigin: CustomOrigin = (origin, callback) => {
    if (!origin) {
      callback(null, false);
      return;
    }

    if (isOriginAllowed(origin, aiConfig.allowedOrigins)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS'));
  };

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  setupSwagger(app);

  const port = Number(process.env.PORT ?? '4000');

  await app.listen(port);
}

if (require.main === module) {
  void bootstrap();
}
