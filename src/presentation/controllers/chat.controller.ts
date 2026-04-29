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
import type { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import {
  ProcessChatRequestDto,
  ProcessChatResponseDto,
} from '../../application/dto';
import { ProcessChatUseCase } from '../../application/use-cases';
import type { UploadedAudioFile } from '../../domain/entities';
import { AI_ENGINE_CONFIG, isOriginAllowed } from '../../infrastructure/config';
import type { AIEngineConfig } from '../../infrastructure/config';
import { ChatThrottlerExceptionFilter } from './chat-throttler-exception.filter';

type MulterFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

@ApiTags('Chat')
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
  @ApiOperation({
    summary: 'Processar mensagem multimodal de chat',
    description:
      'Encaminha texto e/ou audio do usuario para o AI Engine, validando origem, autenticacao interna e limites de uso.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description:
      'Payload do chat. Pode ser enviado como JSON (`application/json`) com `text`/`internalSecret` ou como `multipart/form-data` incluindo um arquivo de audio no campo `audio`.',
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          maxLength: 4000,
          description:
            'Conteudo textual da mensagem do usuario. Pelo menos um entre `text` ou `audio` deve ser informado.',
          example: 'Ola, pode me ajudar a contratar uma proposta?',
        },
        audio: {
          type: 'string',
          format: 'binary',
          description:
            'Arquivo de audio multipart com a mensagem falada do usuario.',
        },
        internalSecret: {
          type: 'string',
          description:
            'Segredo interno opcional usado por chamadas servidor-a-servidor; clientes finais nao devem informar.',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Mensagem aceita e encaminhada ao AI Engine.',
    type: ProcessChatResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Requisicao rejeitada por validacao de payload.',
    type: ProcessChatResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Origem nao permitida pela politica de CORS interna.',
    type: ProcessChatResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de chamadas por janela atingido.',
  })
  @ApiBadGatewayResponse({
    description: 'Falha ao se comunicar com o AI Engine.',
    type: ProcessChatResponseDto,
  })
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  @UseInterceptors(FileInterceptor('audio'))
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async message(
    @Body() body: ProcessChatRequestDto,
    @UploadedFile() uploadedFile: MulterFile | undefined,
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
    file: MulterFile | undefined,
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
