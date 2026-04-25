import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProcessChatRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  text?: string;

  @IsOptional()
  @IsString()
  internalSecret?: string;
}
