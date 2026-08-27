import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { parseCvText, ParsedCV } from '../ai-libs/parseCv';
import { recommendCareers, analyzeSkillGap, aiRecommendations } from '../ai-libs/recommend';
import { checkATS } from '../ai-libs/ats';
import { SKILL_MASTER } from '../ai-libs/skills';
import { AiRecommendDto } from './dto/ai-recommend.dto';
import { AtsCheckDto } from './dto/ats-check.dto';
import { GenerateCvDto } from './dto/generate-cv.dto';

function safeArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

function skillCoverage(parsed: ParsedCV) {
  const names = parsed.skills.map((s) => s.name.toLowerCase());
  const known = SKILL_MASTER.filter((s) => names.includes(s.name.toLowerCase())).length;
  return {
    known,
    total: parsed.skills.length,
    recognizedRate: parsed.skills.length ? Math.round((known / parsed.skills.length) * 100) : 0,
  };
}

@Controller()
export class AiController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('ai/recommend')
  @UseGuards(JwtAuthGuard)
  async recommend(@Req() req: any, @Body() body: AiRecommendDto) {
    if (!req.user) throw new UnauthorizedException('Belum login');
    const skills: string[] = Array.isArray(body.skills) ? body.skills.map(String) : [];
    const dreamRole = body.dreamRole;
    const useAI = body.useAI;

    if (useAI) {
      return aiRecommendations(skills, dreamRole);
    }
    const recommendations = recommendCareers(skills);
    const gap = analyzeSkillGap(skills, dreamRole);
    return { recommendations, gap, advice: gap[0]?.message ?? '' };
  }

  @Post('ai/ats')
  @UseGuards(JwtAuthGuard)
  async ats(@Req() req: any, @Body() body: AtsCheckDto) {
    if (!req.user) throw new UnauthorizedException('Belum login');
    if (!body.text || body.text.length < 10) {
      throw new BadRequestException('Teks CV terlalu pendek');
    }
    return checkATS(body.text);
  }

  @Post('cv/generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Req() req: any, @Body() body: GenerateCvDto, @Res() res: any) {
    if (!req.user) throw new UnauthorizedException('Belum login');
    if (!body.name || body.name.length < 2) throw new BadRequestException('Data tidak lengkap');

    const { generateCvPdfBuffer } = await import('../ai-libs/cvPdf');
    const buffer = await generateCvPdfBuffer(body);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CV-${body.name.replace(/\s+/g, '-')}.pdf"`);
    res.send(buffer);
  }

  @Post('cv/parse')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async parse(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: any,
  ) {
    if (!req.user) throw new UnauthorizedException('Belum login');
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenException('Hanya akun mahasiswa');
    }
    if (!file?.buffer) throw new BadRequestException('File tidak ditemukan');

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    try {
      const buffer = file.buffer;
      let text = '';
      try {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy().catch(() => {});
        text = result.text ?? '';
      } catch {
        text = buffer.toString('utf-8');
      }

      if (!text || text.trim().length < 50) {
        throw new BadRequestException(
          'Gagal membaca isi PDF. Pastikan file adalah CV dengan teks (bukan hasil scan gambar).',
        );
      }

      const parsed: ParsedCV = await parseCvText(text);

      const savedCv = await this.prisma.cV.create({
        data: {
          userId: user.id,
          filename: file.originalname ?? 'cv.pdf',
          text,
          analysis: JSON.stringify(parsed),
        },
      });

      let profile = user.profile;
      if (!profile) {
        profile = await this.prisma.studentProfile.create({
          data: { userId: user.id, skills: JSON.stringify(parsed.skills.map((s) => s.name)) },
        });
      } else {
        const currentSkills = safeArray(profile.skills);
        const merged = Array.from(new Set([...currentSkills, ...parsed.skills.map((s) => s.name)]));
        await this.prisma.studentProfile.update({
          where: { id: profile.id },
          data: {
            skills: JSON.stringify(merged),
            education: parsed.education.length ? JSON.stringify(parsed.education) : profile.education,
            experiences: parsed.experiences.length ? JSON.stringify(parsed.experiences) : profile.experiences,
            projects: parsed.projects.length ? JSON.stringify(parsed.projects) : profile.projects,
            aiReview: JSON.stringify(parsed),
          },
        });
      }

      for (const skill of parsed.skills) {
        const skillRecord = await this.prisma.skill.upsert({
          where: { name: skill.name },
          update: {},
          create: { name: skill.name, category: skill.category },
        });
        await this.prisma.userSkill.upsert({
          where: { userId_skillId: { userId: user.id, skillId: skillRecord.id } },
          update: {},
          create: { userId: user.id, skillId: skillRecord.id },
        });
      }

      const knowledge = skillCoverage(parsed);
      const cvScore = Math.min(95, 45 + parsed.skills.length * 4 + parsed.education.length * 3 + parsed.projects.length * 3 + parsed.experiences.length * 5);

      await this.prisma.studentProfile.update({
        where: { id: profile.id },
        data: { cvScore, atsScore: Math.min(90, cvScore - 5) },
      });

      return {
        cvId: savedCv.id,
        parsed,
        stats: {
          skillCount: parsed.skills.length,
          educationCount: parsed.education.length,
          experienceCount: parsed.experiences.length,
          projectCount: parsed.projects.length,
          cvScore,
          knowledge,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      console.error('CV parse error:', error?.message ?? error);
      throw new BadRequestException('Gagal memproses CV: ' + (error?.message ?? 'Unknown error'));
    }
  }
}
