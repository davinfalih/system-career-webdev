import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Akses ditolak');
  }

  @Post('institutions')
  async createInstitution(@Req() req: any, @Body() body: CreateInstitutionDto) {
    this.checkAdmin(req);
    if (!body.name || body.name.length < 2) throw new BadRequestException('Data tidak valid');
    const institution = await this.prisma.institution.create({
      data: {
        name: body.name,
        type: body.type ?? 'UNIVERSITY',
        city: body.city,
        verified: true,
      },
    });
    return { ok: true, institution };
  }

  @Post('companies')
  async createCompany(@Req() req: any, @Body() body: CreateCompanyDto) {
    this.checkAdmin(req);
    if (!body.name || body.name.length < 2 || !body.industry || !body.location) {
      throw new BadRequestException('Data tidak valid');
    }
    const company = await this.prisma.company.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        industry: body.industry,
        location: body.location,
        description: body.description ?? '',
        website: body.website,
        verified: body.verified ?? true,
      },
    });
    return { ok: true, company };
  }

  @Post('skills')
  async createSkill(@Req() req: any, @Body() body: CreateSkillDto) {
    this.checkAdmin(req);
    if (!body.name) throw new BadRequestException('Data tidak valid');
    const existing = await this.prisma.skill.findUnique({ where: { name: body.name } });
    if (existing) throw new BadRequestException('Skill sudah ada');

    const skill = await this.prisma.skill.create({
      data: {
        name: body.name,
        category: body.category ?? 'HARD',
        demand: body.demand ?? 50,
      },
    });
    return { ok: true, skill };
  }

  @Patch('skills')
  @HttpCode(200)
  async updateSkill(@Req() req: any, @Body() body: UpdateSkillDto) {
    this.checkAdmin(req);
    if (!body.id) throw new BadRequestException('ID diperlukan');
    const skill = await this.prisma.skill.update({
      where: { id: body.id },
      data: {
        ...(body.demand !== undefined && { demand: Number(body.demand) }),
        ...(body.category !== undefined && { category: body.category }),
      },
    });
    return { ok: true, skill };
  }

  @Delete('skills')
  @HttpCode(200)
  async deleteSkill(@Req() req: any, @Query('id') id: string) {
    this.checkAdmin(req);
    if (!id) throw new BadRequestException('ID diperlukan');
    await this.prisma.skill.delete({ where: { id } });
    return { ok: true };
  }

  @Get('stats')
  async stats(@Req() req: any) {
    this.checkAdmin(req);
    const [totalUsers, totalCompanies, totalInstitutions, totalJobs, totalApplications, totalVerified] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count(),
      this.prisma.institution.count(),
      this.prisma.job.count(),
      this.prisma.application.count(),
      this.prisma.user.count({ where: { verified: true } }),
    ]);
    return { totalUsers, totalCompanies, totalInstitutions, totalJobs, totalApplications, totalVerified };
  }

  @Get('users')
  async users(@Req() req: any) {
    this.checkAdmin(req);
    const users = await this.prisma.user.findMany({
      include: { institution: true, company: true, profile: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { users };
  }

  @Get('companies')
  async companies(@Req() req: any) {
    this.checkAdmin(req);
    const companies = await this.prisma.company.findMany({
      include: { _count: { select: { users: true, jobs: true } }, users: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { companies };
  }

  @Get('institutions')
  async institutions(@Req() req: any) {
    this.checkAdmin(req);
    const institutions = await this.prisma.institution.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { institutions };
  }

  @Get('skills')
  async skills(@Req() req: any) {
    this.checkAdmin(req);
    const skills = await this.prisma.skill.findMany({
      include: { _count: { select: { userSkills: true } } },
      orderBy: { demand: 'desc' },
    });
    return { skills };
  }

  @Get('monetization')
  async monetization(@Req() req: any) {
    this.checkAdmin(req);
    const [totalCompanies, totalInstitutions, totalUsers, totalJobs] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.institution.count(),
      this.prisma.user.count(),
      this.prisma.job.count(),
    ]);
    return { totalCompanies, totalInstitutions, totalUsers, totalJobs };
  }
}
