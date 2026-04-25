import { Module } from '@nestjs/common';
import { HealthController } from './presentation/controllers';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
