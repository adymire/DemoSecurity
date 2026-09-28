import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class UpdateOnboardingDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  get(@CurrentUser() user: { sub: string }) {
    return this.onboarding.get(user.sub);
  }

  /** Authenticated, validated onboarding update persisted server-side. */
  @UseGuards(JwtAuthGuard)
  @Put()
  update(@CurrentUser() user: { sub: string }, @Body() dto: UpdateOnboardingDto) {
    return this.onboarding.update(user.sub, dto);
  }
}
