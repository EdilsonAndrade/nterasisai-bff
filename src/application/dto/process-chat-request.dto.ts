import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProcessChatRequestDto {
  @ApiPropertyOptional({
    description:
      'Conteudo textual da mensagem do usuario. Pelo menos um entre `text` ou `audio` deve ser informado.',
    example: 'Ola, pode me ajudar a contratar uma proposta?',
    maxLength: 4000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  text?: string;

  @ApiPropertyOptional({
    description:
      'Segredo interno opcional usado por chamadas servidor-a-servidor; clientes finais nao devem informar.',
  })
  @IsOptional()
  @IsString()
  internalSecret?: string;
}
