import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(200)
  async update(@Req() req: any, @Body() body: UpdateCompanyDto) {
    if (req.user.role !== 'COMPANY' || !req.user.companyId) {
      throw new ForbiddenException('Akses ditolak');
    }
    if (body.name !== undefined && body.name.length < 2) {
      throw new BadRequestException('Nama minimal 2 karakter');
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.industry !== undefined) data.industry = body.industry;
    if (body.location !== undefined) data.location = body.location;
    if (body.website !== undefined) data.website = body.website;

    const company = await this.prisma.company.update({
      where: { id: req.user.companyId },
      data,
    });

    return { ok: true, company };
  }
}
