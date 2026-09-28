import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class SignupCheckDto {
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  rawHwid?: string;

  @IsOptional()
  @IsString()
  hwidSignature?: string;

  @IsOptional()
  @IsString()
  installSecret?: string;

  @IsOptional()
  vmFlags?: { vendorString?: string; macPrefix?: string; hypervisorPresent?: boolean };

  @IsOptional()
  @IsString()
  installationId?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * Step 1 of OAuth authorization-code flow: redirect to provider.
   * Frontend must link here, never call provider token APIs with a secret.
   */
  @Get('google')
  googleStart(@Res() res: Response) {
    return res.redirect(this.auth.googleAuthorizeUrl());
  }

  @Get('github')
  githubStart(@Res() res: Response) {
    return res.redirect(this.auth.githubAuthorizeUrl());
  }

  /** Provider callbacks — code exchange happens server-side (see AuthService). */
  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.auth.handleOAuthCallback('GOOGLE', code ?? 'demo-code', req);
    return res.json(result);
  }

  @Get('github/callback')
  async githubCallback(@Query('code') code: string, @Req() req: Request, @Res() res: Response) {
    const result = await this.auth.handleOAuthCallback('GITHUB', code ?? 'demo-code', req);
    return res.json(result);
  }

  /**
   * Public pre-signup gate — call BEFORE creating the account so the UI can
   * show the "already linked" popup or VM notice without spending free credit.
   */
  @Post('signup-check')
  signupCheck(@Body() dto: SignupCheckDto, @Req() req: Request) {
    return this.auth.signupCheck(dto, req);
  }

  /** Dev-only credential login so the flow is testable without real OAuth keys. */
  @Post('login')
  async login(@Body() body: { email: string; displayName?: string }, @Req() req: Request) {
    return this.auth.loginWithEmail(body.email, body.displayName, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { sub: string }) {
    return this.auth.profile(user.sub);
  }

  /** Suspension tier + free-credit pause state for UI banners. */
  @UseGuards(JwtAuthGuard)
  @Get('security-status')
  securityStatus(@CurrentUser() user: { sub: string }) {
    return this.auth.securityStatus(user.sub);
  }
}
