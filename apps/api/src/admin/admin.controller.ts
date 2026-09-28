import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard, AdminGuard } from '../common/guards/auth.guards';

class RestrictDto {
  @IsIn(['RESTRICTED', 'TEMPORARY_BLOCK', 'PERMANENT_BLOCK'])
  status!: 'RESTRICTED' | 'TEMPORARY_BLOCK' | 'PERMANENT_BLOCK';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  blockedUntil?: string;
}

class AnnounceDto {
  @IsString()
  title!: string;

  @IsString()
  body!: string;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  /** Least-privilege, paginated user list (docs/integration.md). */
  @Get('users')
  users(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.admin.listUsers(Number(page), Number(limit));
  }

  @Get('users/:id')
  userDetail(@Param('id') id: string) {
    return this.admin.userDetail(id);
  }

  @Get('events')
  events(@Query('limit') limit = '50') {
    return this.admin.recentEvents(Number(limit));
  }

  /** Three suspension levels: RESTRICTED / TEMPORARY_BLOCK / PERMANENT_BLOCK. */
  @Post('users/:id/restriction')
  restrict(@Param('id') id: string, @Body() dto: RestrictDto) {
    return this.admin.applyRestriction(id, dto, 'admin');
  }

  @Delete('users/:id/restriction')
  removeRestriction(@Param('id') id: string) {
    return this.admin.removeRestriction(id, 'admin');
  }

  /** Platform announcements (separate from fraud engine). */
  @Post('announcements')
  announce(@Body() dto: AnnounceDto) {
    return this.admin.announce(dto.title, dto.body);
  }

  @Get('announcements')
  announcements() {
    return this.admin.announcements();
  }
}
