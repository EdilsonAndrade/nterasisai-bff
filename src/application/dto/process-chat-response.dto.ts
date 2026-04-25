import { ChatDispatchStatus } from '../../domain/entities';

export class ProcessChatResponseDto {
  status!: ChatDispatchStatus;
  correlationId?: string;
  message?: string;
  reason?: string;
}
