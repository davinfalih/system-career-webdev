import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateApplicationStatusDto } from './dto/update-status.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my')
  async myApplications(@Req() req: any) {
    if (req.user.role !== 'STUDENT') throw new ForbiddenException('Akses ditolak');
    const applications = await this.prisma.application.findMany({
      where: { userId: req.user.id },
      include: { job: { include: { company: true } }, interview: true },
      orderBy: { createdAt: 'desc' },
    });
    return { applications };
  }

  @Post(':id/status')
  @HttpCode(200)
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: UpdateApplicationStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!application) throw new NotFoundException('Lamaran tidak ditemukan');

    if (req.user.role === 'COMPANY') {
      if (application.job.companyId !== req.user.companyId) {
        throw new ForbiddenException('Akses ditolak');
      }
    } else if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Akses ditolak');
    }

    const allowed = ['SUBMITTED', 'UNDER_REVIEW', 'SCREENING', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
    if (!allowed.includes(body.status)) {
      throw new BadRequestException('Status tidak valid');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: body.status },
    });

    const statusLabels: Record<string, string> = {
      SUBMITTED: 'Terkirim',
      UNDER_REVIEW: 'Sedang Ditinjau',
      SCREENING: 'Proses Screening',
      INTERVIEW: 'Undangan Wawancara',
      ACCEPTED: 'Diterima',
      REJECTED: 'Ditolak',
    };

    await this.prisma.notification.create({
      data: {
        userId: application.userId,
        title: 'Update Status Lamaran',
        message: `Status lamaranmu untuk ${application.job.title} berubah menjadi "${statusLabels[body.status] ?? body.status}"${body.feedback ? `.\nFeedback: ${body.feedback}` : '.'}`,
      },
    });

    return { ok: true, application: updated };
  }

  @Post(':id/interview')
  @HttpCode(200)
  async scheduleInterview(@Req() req: any, @Param('id') id: string, @Body() body: ScheduleInterviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!application) throw new NotFoundException('Lamaran tidak ditemukan');

    if (req.user.role === 'COMPANY') {
      if (application.job.companyId !== req.user.companyId) {
        throw new ForbiddenException('Akses ditolak');
      }
    } else if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Akses ditolak');
    }

    if (!body.scheduledAt) throw new BadRequestException('Data wawancara tidak valid');

    const interview = await this.prisma.interview.upsert({
      where: { applicationId: id },
      update: {
        scheduledAt: new Date(body.scheduledAt),
        link: body.link || null,
        notes: body.notes || null,
      },
      create: {
        applicationId: id,
        scheduledAt: new Date(body.scheduledAt),
        link: body.link || null,
        notes: body.notes || null,
      },
    });

    await this.prisma.application.update({
      where: { id },
      data: { status: 'INTERVIEW' },
    });

    await this.prisma.notification.create({
      data: {
        userId: application.userId,
        title: 'Undangan Wawancara',
        message: `Kamu diundang wawancara untuk ${application.job.title} pada ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(body.scheduledAt))}.${body.link ? `\nLink: ${body.link}` : ''}`,
      },
    });

    return { ok: true, interview };
  }
}
