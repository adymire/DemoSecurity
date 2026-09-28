import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { RiskService } from './risk.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class EvaluateDto {
  @IsIn(['signup', 'login', 'prompt', 'checkout'])
  action!: 'signup' | 'login' | 'prompt' | 'checkout';

  @IsOptional()
  @IsString()
  installationId?: string;

  @IsOptional()
  @IsString()
  deviceRiskId?: string;
}

class IngestDto {
  @IsOptional()
  @IsString()
  installation?: string;

  @IsOptional()
  @IsString()
  reasonCode?: string;
}

@ApiTags('risk')
@Controller('risk')
export class RiskController {
  constructor(private readonly risk: RiskService) {}

  /** SDK/backend hook: evaluate current user (never trust client-submitted scores). */
  @UseGuards(JwtAuthGuard)
  @Post('evaluate')
  evaluate(@CurrentUser() user: { sub: string }, @Body() dto: EvaluateDto) {
    return this.risk.evaluate(user.sub, dto);
  }

  /** SDK event collector hook: store a hashed, expiring signal. */
  @UseGuards(JwtAuthGuard)
  @Post('signals')
  ingest(@CurrentUser() user: { sub: string }, @Body() dto: IngestDto) {
    return this.risk.ingest({ userId: user.sub, ...dto });
  }
}
