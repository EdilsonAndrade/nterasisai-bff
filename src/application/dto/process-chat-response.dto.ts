import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ChatDispatchStatus } from '../../domain/entities';

export class ProcessChatResponseDto {
  @ApiProperty({
    description: 'Resultado do processamento da mensagem pelo BFF.',
    enum: ['accepted', 'rejected', 'failed', 'blocked'],
    example: 'accepted',
  })
  status!: ChatDispatchStatus;

  @ApiPropertyOptional({
    description:
      'Identificador de correlacao para rastreamento ponta a ponta da requisicao.',
    example: 'req_01HZ8C7DAB1S2XKPN4JW2QF7Y6',
  })
  correlationId?: string;

  @ApiPropertyOptional({
    description: 'Mensagem informativa associada ao resultado do processamento.',
  })
  message?: string;

  @ApiPropertyOptional({
    description:
      'Motivo do bloqueio, rejeicao ou falha quando o status nao for `accepted`.',
    example: 'Origin is not allowed.',
  })
  reason?: string;
}
