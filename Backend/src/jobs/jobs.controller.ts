import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { computeJobMatch } from '../ai-libs/jobMatch';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobListQueryDto } from './dto/job-query.dto';

function safeArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

@Controller()
export class JobsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('home')
  async home() {
    const [companies, institutions, recentJobs] = await Promise.all([
      this.prisma.company.findMany({ where: { verified: true }, orderBy: { name: 'asc' }, take: 8 }),
      this.prisma.institution.findMany({ orderBy: { name: 'asc' }, take: 8 }),
      this.prisma.job.findMany({
        where: { status: 'OPEN' },
        include: { company: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);
    return { companies, institutions, recentJobs };
  }

  @Get('bookmarks/my')
  @UseGuards(JwtAuthGuard)
  async myBookmarks(@Req() req: any) {
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenException('Hanya akun mahasiswa');
    }
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { bookmarks };
  }

  @Get('jobs')
  async list(@Query() q: JobListQueryDto) {
    const where: Record<string, unknown> = { status: 'OPEN' };
    if (q.q) {
      where.OR = [
        { title: { contains: q.q } },
        { description: { contains: q.q } },
        { company: { name: { contains: q.q } } },
      ];
    }
    if (q.type) where.type = q.type;
    if (q.mode) where.mode = q.mode;
    if (q.major) where.majorRequired = q.major;
    if (q.fresh === 'true') where.forFreshGrads = true;

    const jobs = await this.prisma.job.findMany({
      where,
      include: { company: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const serialized = jobs.map((j) => ({
      ...j,
      mustHaveSkills: safeArray(j.mustHaveSkills),
      niceToHaveSkills: safeArray(j.niceToHaveSkills),
    }));

    const totalJobs = await this.prisma.job.count({ where: { status: 'OPEN' } });
    const filters = {
      companies: await this.prisma.company.findMany({ where: { verified: true }, orderBy: { name: 'asc' } }),
      majors: await this.prisma.job.findMany({ where: { majorRequired: { not: null } }, distinct: ['majorRequired'], select: { majorRequired: true } }),
    };

    return { jobs: serialized, totalJobs, filters };
  }

  @Get('jobs/:id')
  async get(@Param('id') id: string, @Req() req: any) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true, _count: { select: { applications: true } } },
    });
    if (!job) throw new NotFoundException('Lowongan tidak ditemukan');

    let matchScore: number | null = null;
    let applied = false;
    let bookmarked = false;

    if (req.user) {
      const skills = safeArray(req.userProfile?.skills ?? null);
      matchScore = computeJobMatch(skills, job);
      const app = await this.prisma.application.findUnique({
        where: { userId_jobId: { userId: req.user.id, jobId: job.id } },
      });
      applied = Boolean(app);
      const bm = await this.prisma.bookmark.findUnique({
        where: { userId_jobId: { userId: req.user.id, jobId: job.id } },
      });
      bookmarked = Boolean(bm);
    }

    const similar = await this.prisma.job.findMany({
      where: { status: 'OPEN', id: { not: job.id }, type: job.type },
      include: { company: true },
      take: 4,
    });

    return {
      job: {
        ...job,
        mustHaveSkills: safeArray(job.mustHaveSkills),
        niceToHaveSkills: safeArray(job.niceToHaveSkills),
      },
      matchScore,
      applied,
      bookmarked,
      similar,
    };
  }

  @Post('jobs')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() d: CreateJobDto) {
    if (req.user.role !== 'COMPANY' || !req.user.companyId) {
      throw new ForbiddenException('Akses ditolak');
    }
    if (!d.title || d.title.length < 3) throw new BadRequestException('Judul minimal 3 karakter');
    if (!d.description || d.description.length < 20) throw new BadRequestException('Deskripsi minimal 20 karakter');
    if (!['INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'PROJECT_BASED'].includes(d.type)) {
      throw new BadRequestException('Tipe lowongan tidak valid');
    }

    const job = await this.prisma.job.create({
      data: {
        companyId: req.user.companyId,
        title: d.title,
        type: d.type,
        mode: d.mode ?? 'REMOTE',
        location: d.location,
        salary: d.salary,
        description: d.description,
        mustHaveSkills: JSON.stringify(Array.isArray(d.mustHaveSkills) ? d.mustHaveSkills : []),
        niceToHaveSkills: JSON.stringify(Array.isArray(d.niceToHaveSkills) ? d.niceToHaveSkills : []),
        majorRequired: d.majorRequired,
        minGpa: d.minGpa,
        forFreshGrads: d.forFreshGrads ?? true,
        deadline: d.deadline ? new Date(d.deadline) : null,
        status: d.status ?? 'OPEN',
      },
    });
    return { ok: true, job };
  }

  @Put('jobs/:id')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: any, @Param('id') id: string, @Body() d: UpdateJobDto) {
    if (req.user.role !== 'COMPANY') throw new ForbiddenException('Akses ditolak');
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Lowongan tidak ditemukan');
    if (job.companyId !== req.user.companyId) throw new ForbiddenException('Akses ditolak');

    const data: Record<string, unknown> = {};
    if (d.title !== undefined) data.title = d.title;
    if (d.type !== undefined) data.type = d.type;
    if (d.mode !== undefined) data.mode = d.mode;
    if (d.location !== undefined) data.location = d.location;
    if (d.salary !== undefined) data.salary = d.salary;
    if (d.description !== undefined) data.description = d.description;
    if (d.mustHaveSkills !== undefined) data.mustHaveSkills = JSON.stringify(d.mustHaveSkills);
    if (d.niceToHaveSkills !== undefined) data.niceToHaveSkills = JSON.stringify(d.niceToHaveSkills);
    if (d.majorRequired !== undefined) data.majorRequired = d.majorRequired;
    if (d.minGpa !== undefined) data.minGpa = d.minGpa;
    if (d.forFreshGrads !== undefined) data.forFreshGrads = d.forFreshGrads;
    if (d.deadline !== undefined) data.deadline = d.deadline ? new Date(d.deadline) : null;
    if (d.status !== undefined) data.status = d.status;

    const updated = await this.prisma.job.update({ where: { id }, data });
    return { ok: true, job: updated };
  }

  @Delete('jobs/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'COMPANY') throw new ForbiddenException('Akses ditolak');
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Lowongan tidak ditemukan');
    if (job.companyId !== req.user.companyId) throw new ForbiddenException('Akses ditolak');

    await this.prisma.application.deleteMany({ where: { jobId: id } });
    await this.prisma.bookmark.deleteMany({ where: { jobId: id } });
    await this.prisma.job.delete({ where: { id } });
    return { ok: true };
  }

  @Post('jobs/:id/apply')
  @UseGuards(JwtAuthGuard)
  async apply(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenException('Hanya akun mahasiswa');
    }
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Lowongan tidak ditemukan');
    if (job.status !== 'OPEN') throw new BadRequestException('Lowongan sudah ditutup');

    const existing = await this.prisma.application.findUnique({
      where: { userId_jobId: { userId: req.user.id, jobId: job.id } },
    });
    if (existing) throw new BadRequestException('Kamu sudah melamar lowongan ini');

    const user = await this.prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } });
    const skills = safeArray(user?.profile?.skills ?? null);
    const matchScore = computeJobMatch(skills, job);

    const application = await this.prisma.application.create({
      data: { userId: req.user.id, jobId: job.id, status: 'SUBMITTED', matchScore },
    });

    const hrUser = await this.prisma.user.findFirst({
      where: { companyId: job.companyId, role: 'COMPANY' },
    });
    if (hrUser) {
      await this.prisma.notification.create({
        data: {
          userId: hrUser.id,
          title: 'Lamaran Baru',
          message: `${user?.name ?? 'Seseorang'} melamar ${job.title} dengan match score ${matchScore}%.`,
        },
      });
    }
    await this.prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Lamaran Terkirim',
        message: `Lamaranmu untuk ${job.title} telah terkirim. Pantau statusnya di menu Lamaran Saya.`,
      },
    });

    return { ok: true, application };
  }

  @Post('jobs/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  async bookmark(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenException('Hanya akun mahasiswa');
    }
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Lowongan tidak ditemukan');

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_jobId: { userId: req.user.id, jobId: job.id } },
    });
    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await this.prisma.bookmark.create({ data: { userId: req.user.id, jobId: job.id } });
    return { bookmarked: true };
  }
}
