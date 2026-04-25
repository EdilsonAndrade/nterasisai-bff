import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from '../../application/dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Verificar disponibilidade do BFF',
    description:
      'Retorna status textual e timestamp ISO 8601 para confirmar que o servico esta online.',
  })
  @ApiOkResponse({
    description: 'Servico operacional.',
    type: HealthResponseDto,
  })
  getHealthStatus(): HealthResponseDto {
    return {
      status: 'Interasis Server Online',
      timestamp: new Date().toISOString(),
    };
  }
}
