import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('institutions')
  async institutions() {
    const institutions = await this.prisma.institution.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, type: true },
    });
    return { institutions };
  }

  @Get('skills')
  async skills() {
    const skills = await this.prisma.skill.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, category: true },
    });
    return { skills };
  }
}
