import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my')
  async myNotifications(@Req() req: any) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { notifications };
  }

  @Post('read')
  @HttpCode(200)
  async markRead(@Req() req: any) {
    await this.prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    return { ok: true };
  }
}
