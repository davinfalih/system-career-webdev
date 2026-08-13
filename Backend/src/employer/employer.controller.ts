import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { EmployerApplicationsQueryDto } from './dto/employer-applications-query.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class EmployerController {
  constructor(private readonly prisma: PrismaService) {}

  private checkCompany(req: any) {
    if (req.user.role !== 'COMPANY' || !req.user.companyId) {
      throw new ForbiddenException('Akses ditolak');
    }
  }

  @Get('company/me')
  async companyMe(@Req() req: any) {
    this.checkCompany(req);
    const company = await this.prisma.company.findUnique({
      where: { id: req.user.companyId },
    });
    if (!company) throw new BadRequestException('Perusahaan tidak ditemukan');
    return { company };
  }

  @Get('employer/jobs')
  async jobs(@Req() req: any) {
    this.checkCompany(req);
    const jobs = await this.prisma.job.findMany({
      where: { companyId: req.user.companyId },
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { jobs };
  }

  @Get('employer/stats')
  async stats(@Req() req: any) {
    this.checkCompany(req);
    const companyId = req.user.companyId;

    const [company, totalJobs, openJobs, totalApplications, interviews, recentApplications] = await Promise.all([
      this.prisma.company.findUnique({ where: { id: companyId } }),
      this.prisma.job.count({ where: { companyId } }),
      this.prisma.job.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.application.count({ where: { job: { companyId } } }),
      this.prisma.interview.findMany({
        where: { application: { job: { companyId } } },
        include: { application: { include: { user: true, job: true } } },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.application.findMany({
        where: { job: { companyId } },
        include: { user: true, job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    return {
      company,
      totalJobs,
      openJobs,
      totalApplications,
      interviews,
      recentApplications,
    };
  }

  @Get('employer/applications')
  async applications(@Req() req: any, @Query() q: EmployerApplicationsQueryDto) {
    this.checkCompany(req);
    const where: Record<string, unknown> = { job: { companyId: req.user.companyId } };
    if (q.jobId) where.jobId = q.jobId;

    const applications = await this.prisma.application.findMany({
      where,
      include: {
        user: true,
        job: { include: { company: true } },
        interview: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { applications };
  }

  @Get('employer/interviews')
  async interviews(@Req() req: any) {
    this.checkCompany(req);
    const interviews = await this.prisma.interview.findMany({
      where: { application: { job: { companyId: req.user.companyId } } },
      include: {
        application: { include: { user: true, job: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return { interviews };
  }
}
