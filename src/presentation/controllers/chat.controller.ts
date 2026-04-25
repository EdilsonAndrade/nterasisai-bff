import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ProcessChatRequestDto,
  ProcessChatResponseDto,
} from '../../application/dto';
import { ProcessChatUseCase } from '../../application/use-cases';
import { UploadedAudioFile } from '../../domain/entities';
import {
  AI_ENGINE_CONFIG,
  AIEngineConfig,
  isOriginAllowed,
} from '../../infrastructure/config';
import { ChatThrottlerExceptionFilter } from './chat-throttler-exception.filter';

@Controller('chat')
@UseGuards(ThrottlerGuard)
@UseFilters(ChatThrottlerExceptionFilter)
export class ChatController {
  constructor(
    private readonly processChatUseCase: ProcessChatUseCase,
    @Inject(AI_ENGINE_CONFIG)
    private readonly aiEngineConfig: AIEngineConfig,
  ) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
    }),
  )
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async message(
    @Body() body: ProcessChatRequestDto,
    @UploadedFile() uploadedFile: Express.Multer.File | undefined,
    @Headers('origin') origin: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ProcessChatResponseDto> {
    if (!isOriginAllowed(origin, this.aiEngineConfig.allowedOrigins)) {
      response.status(HttpStatus.FORBIDDEN);
      return {
        status: 'blocked',
        reason: 'Origin is not allowed.',
      };
    }

    const audioFile = this.toUploadedAudio(uploadedFile);
    const result = await this.processChatUseCase.execute({
      text: body.text,
      audioFile,
      origin,
      internalSecret: body.internalSecret,
    });

    if (result.status === 'rejected') {
      response.status(HttpStatus.BAD_REQUEST);
    }

    if (result.status === 'failed') {
      response.status(HttpStatus.BAD_GATEWAY);
    }

    return result;
  }

  private toUploadedAudio(
    file: Express.Multer.File | undefined,
  ): UploadedAudioFile | undefined {
    if (!file) {
      return undefined;
    }

    return {
      fileName: file.originalname,
      mediaType: file.mimetype,
      bytes: file.buffer,
    };
  }
}
