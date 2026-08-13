import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNameDto } from './dto/update-name.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const ALLOWED = /^data:image\/(png|jpe?g|webp|gif);base64,/;

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('name')
  async updateName(@Req() req: any, @Body() body: UpdateNameDto) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2) throw new BadRequestException('Nama minimal 2 karakter');
    if (name.length > 80) throw new BadRequestException('Nama terlalu panjang');

    const updated = await this.prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });
    return { ok: true, name: updated.name };
  }

  @Post('photo')
  async uploadPhoto(@Req() req: any, @Body() body: any) {
    const payload: string = typeof body === 'string' ? body : body?.payload;
    if (!payload || !ALLOWED.test(payload.trim())) {
      throw new BadRequestException('Format gambar tidak didukung');
    }

    const clean = payload.trim();
    const extMatch = clean.match(/^data:image\/(png|jpe?g|webp|gif);/);
    const ext = extMatch?.[1] === 'jpeg' ? 'jpg' : (extMatch?.[1] ?? 'png');
    const base64 = clean.split(',')[1];
    if (!base64) throw new BadRequestException('Data gambar tidak valid');

    if (Buffer.byteLength(base64, 'base64') > 3 * 1024 * 1024) {
      throw new BadRequestException('Ukuran gambar maksimal 3MB');
    }

    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    const dir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (user?.image) {
      const prevMatch = user.image.match(/^\/uploads\/([\w.-]+)$/);
      if (prevMatch) {
        const oldFile = path.join(dir, prevMatch[1]);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
    }

    const filename = `profile-${req.user.id}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(dir, filename), Buffer.from(base64, 'base64'));
    const url = `/uploads/${filename}`;

    await this.prisma.user.update({ where: { id: req.user.id }, data: { image: url } });
    return { ok: true, image: url };
  }

  @Get()
  async getProfile(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { institution: true, company: true, profile: true },
    });
    if (!user) throw new BadRequestException('User tidak ditemukan');
    return { user };
  }

  @Post()
  @HttpCode(200)
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    if (req.user.role !== 'STUDENT') {
      throw new BadRequestException('Hanya untuk akun mahasiswa');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });
    if (!user) throw new BadRequestException('User tidak ditemukan');

    const d = body;
    const skills: string[] = Array.isArray(d.skills) ? d.skills.map(String) : [];
    const education = Array.isArray(d.education) ? d.education : [];
    const experiences = Array.isArray(d.experiences) ? d.experiences : [];
    const projects = Array.isArray(d.projects) ? d.projects : [];

    let profile = user.profile;
    if (!profile) {
      profile = await this.prisma.studentProfile.create({ data: { userId: user.id } });
    }

    const cvScore = Math.min(
      99,
      20 +
        Math.min(skills.length, 10) * 4 +
        education.length * 5 +
        experiences.length * 6 +
        projects.length * 5 +
        (d.headline ? 5 : 0) +
        (d.bio ? 3 : 0),
    );

    await this.prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        headline: d.headline || null,
        bio: d.bio || null,
        location: d.location || null,
        phone: d.phone || null,
        skills: JSON.stringify(skills),
        education: education.length ? JSON.stringify(education) : null,
        experiences: experiences.length ? JSON.stringify(experiences) : null,
        projects: projects.length ? JSON.stringify(projects) : null,
        cvScore,
        completed: true,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        major: d.major || null,
        graduationYear: d.graduationYear ? Number(d.graduationYear) : null,
        gpa: d.gpa != null ? Number(d.gpa) : null,
        institutionId: d.institutionId || user.institutionId,
      },
    });

    return { ok: true };
  }
}
