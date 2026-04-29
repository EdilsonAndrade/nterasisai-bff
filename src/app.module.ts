import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProcessChatUseCase } from './application/use-cases';
import { AI_ENGINE_PORT } from './domain/ports';
import {
  AI_ENGINE_CONFIG,
  AIEngineHttpAdapter,
  loadAIEngineConfig,
} from './infrastructure';
import { ChatController, HealthController } from './presentation/controllers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),
  ],
  controllers: [HealthController, ChatController],
  providers: [
    ProcessChatUseCase,
    {
      provide: AI_ENGINE_CONFIG,
      useFactory: () => loadAIEngineConfig(),
    },
    {
      provide: AI_ENGINE_PORT,
      useClass: AIEngineHttpAdapter,
    },
  ],
})
export class AppModule {}
