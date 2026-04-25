import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Mensagem de status do servico.',
    example: 'Interasis Server Online',
  })
  status!: string;

  @ApiProperty({
    description: 'Momento da verificacao em formato ISO 8601.',
    example: '2026-04-25T12:34:56.789Z',
    format: 'date-time',
  })
  timestamp!: string;
}
