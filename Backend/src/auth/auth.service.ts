import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(body: any) {
    const { name, email, password, role, institutionId, major, graduationYear, nim, gpa, companyName, companyIndustry, companyLocation, companyDescription, institutionName, institutionType } = body;

    if (!name || typeof name !== 'string' || name.length < 2) {
      throw new BadRequestException('Nama minimal 2 karakter');
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new BadRequestException('Email tidak valid');
    }
    if (!password || password.length < 6) {
      throw new BadRequestException('Password minimal 6 karakter');
    }
    if (!['STUDENT', 'COMPANY', 'INSTITUTION'].includes(role)) {
      throw new BadRequestException('Role tidak valid');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) throw new BadRequestException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(password, 10);

    let institutionIdResolved = institutionId;
    let companyId: string | undefined;

    if (role === 'STUDENT' && institutionName) {
      const institution = await this.prisma.institution.create({
        data: { name: institutionName, type: institutionType ?? 'SMK' },
      });
      institutionIdResolved = institution.id;
    }

    if (role === 'COMPANY' && companyName) {
      const company = await this.prisma.company.create({
        data: {
          name: companyName,
          slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          industry: companyIndustry ?? 'Lainnya',
          location: companyLocation ?? 'Jakarta',
          description: companyDescription ?? '',
        },
      });
      companyId = company.id;
    }

    const user = await this.prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        institutionId: institutionIdResolved || null,
        companyId: companyId || null,
        nim,
        major,
        graduationYear,
        gpa,
      },
    });

    if (role === 'STUDENT') {
      await this.prisma.studentProfile.create({ data: { userId: user.id } });
    }

    return { ok: true, user: { id: user.id, email: user.email } };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Email atau password salah');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email atau password salah');
    if (user.status === 'BLOCKED') throw new UnauthorizedException('Akun diblokir');

    const token = this.signToken(user);

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image },
    };
  }

  private signToken(user: any) {
    return this.jwt.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        companyId: user.companyId ?? null,
        institutionId: user.institutionId ?? null,
      },
      { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '7d' },
    );
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { institution: true, company: true, profile: true },
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return { ok: true };

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetUrl = `${this.config.get('FRONTEND_URL') ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    const message = [
      'JobMatch - Reset Password',
      `Halo ${user.name},`,
      '',
      'Kami menerima permintaan untuk mereset kata sandi akunmu.',
      'Klik tautan di bawah untuk mereset kata sandi (berlaku 1 jam):',
      '',
      resetUrl,
      '',
      'Jika kamu tidak meminta reset ini, abaikan email ini.',
    ].join('\n');

    console.log(`[RESET] ${email} -> ${resetUrl}`);
    return { message: 'Link reset telah dikirim', debug: message };
  }

  async resetPassword(token: string, password: string) {
    if (!password || password.length < 6) {
      throw new BadRequestException('Password minimal 6 karakter');
    }
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!record || record.used) {
      throw new BadRequestException('Token tidak valid atau sudah digunakan');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token sudah kedaluwarsa');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);

    return { ok: true };
  }

  async findOrCreateOAuthUser(provider: 'google' | 'linkedin', profile: any) {
    const email = profile.email?.toLowerCase();
    if (!email) throw new UnauthorizedException('Email tidak tersedia dari akun ' + provider);

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: profile.name || email.split('@')[0],
          email,
          image: profile.picture || null,
          role: 'STUDENT',
          verified: true,
        },
      });
      await this.prisma.studentProfile.create({ data: { userId: user.id } });
    }

    const token = this.signToken(user);

    return { token, role: user.role };
  }
}
