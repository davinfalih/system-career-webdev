import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyStudentDto } from './dto/verify-student.dto';

@Controller('institution')
@UseGuards(JwtAuthGuard)
export class InstitutionController {
  constructor(private readonly prisma: PrismaService) {}

  private checkInstitution(req: any) {
    if (req.user.role !== 'INSTITUTION' || !req.user.institutionId) {
      throw new ForbiddenException('Akses ditolak');
    }
  }

  @Post('verify')
  @HttpCode(200)
  async verify(@Req() req: any, @Body() body: VerifyStudentDto) {
    this.checkInstitution(req);
    if (!body.userId) throw new BadRequestException('Data tidak valid');

    const student = await this.prisma.user.findUnique({
      where: { id: body.userId },
    });
    if (!student || student.institutionId !== req.user.institutionId) {
      throw new NotFoundException('Mahasiswa tidak ditemukan');
    }

    const updated = await this.prisma.user.update({
      where: { id: student.id },
      data: { verified: Boolean(body.verified) },
    });

    await this.prisma.notification.create({
      data: {
        userId: student.id,
        title: updated.verified ? 'Status Mahasiswa Terverifikasi' : 'Status Verifikasi Dicabut',
        message: updated.verified
          ? 'Selamat! Status mahasiswamu telah diverifikasi oleh institusi. Kamu kini bisa melamar dengan status terverifikasi.'
          : 'Status verifikasi mahasiswamu dicabut oleh institusi. Hubungi pihak institusi untuk info lebih lanjut.',
      },
    });

    return { ok: true, verified: updated.verified };
  }

  @Get('stats')
  async stats(@Req() req: any) {
    this.checkInstitution(req);
    const institutionId = req.user.institutionId;

    const [records, students, applications, topSkills] = await Promise.all([
      this.prisma.tracerStudyRecord.findMany({
        where: { institutionId },
        orderBy: { year: 'asc' },
      }),
      this.prisma.user.findMany({ where: { institutionId, role: 'STUDENT' } }),
      this.prisma.application.findMany({
        where: { user: { institutionId } },
        include: { job: { include: { company: true } } },
      }),
      this.prisma.skill.findMany({ orderBy: { demand: 'desc' }, take: 8 }),
    ]);

    const studentsWithProfile = [];
    for (const student of students) {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId: student.id },
      });
      studentsWithProfile.push({ ...student, profile });
    }

    return {
      institutionId,
      records,
      students: studentsWithProfile,
      applications,
      topSkills,
    };
  }

  @Get('students')
  async students(@Req() req: any) {
    this.checkInstitution(req);
    const students = await this.prisma.user.findMany({
      where: { institutionId: req.user.institutionId, role: 'STUDENT' },
      include: { profile: true },
      orderBy: { name: 'asc' },
    });
    return { students };
  }

  @Get('skills')
  async skills(@Req() req: any) {
    this.checkInstitution(req);
    const institutionId = req.user.institutionId;

    const [skills, students] = await Promise.all([
      this.prisma.skill.findMany({ orderBy: { demand: 'desc' } }),
      this.prisma.user.findMany({
        where: { institutionId, role: 'STUDENT' },
        select: { major: true, _count: { select: { applications: true } } },
      }),
    ]);

    const jobs = await this.prisma.job.findMany({
      where: { status: 'OPEN' },
      include: { company: true, _count: { select: { applications: true } } },
    });

    return { skills, students, jobs };
  }

  @Get('tracer-study')
  async tracerStudy(@Req() req: any) {
    this.checkInstitution(req);
    const institutionId = req.user.institutionId;

    const [records, applications] = await Promise.all([
      this.prisma.tracerStudyRecord.findMany({
        where: { institutionId },
        orderBy: { year: 'asc' },
      }),
      this.prisma.application.findMany({
        where: { user: { institutionId } },
        include: { job: { include: { company: true } }, user: { select: { name: true, major: true } } },
      }),
    ]);

    return { records, applications };
  }
}
