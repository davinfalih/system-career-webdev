import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('auth/register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @HttpCode(200)
  @Post('auth/login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: any) {
    const result = await this.auth.login(body.email, body.password);
    const remember = body.remember === true || body.remember === 'true';
    res.cookie('token', result.token, {
      ...COOKIE_OPTIONS,
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });
    return result;
  }

  @HttpCode(200)
  @Post('auth/logout')
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('token');
    return { ok: true };
  }

  @Get('auth/me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return this.auth.me(req.user.id);
  }

  @HttpCode(200)
  @Post('auth/forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(body.email);
  }

  @HttpCode(200)
  @Post('auth/reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @Get('auth/oauth/:provider')
  async oauthStart(@Param('provider') provider: string, @Res() res: any) {
    const frontend = this.config.get('FRONTEND_URL') ?? 'http://localhost:3000';
    if (provider === 'google') {
      const params = new URLSearchParams({
        client_id: this.config.get('GOOGLE_CLIENT_ID') ?? '',
        redirect_uri: `${frontend}/api/auth/oauth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
      });
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    } else if (provider === 'linkedin') {
      const params = new URLSearchParams({
        client_id: this.config.get('LINKEDIN_CLIENT_ID') ?? '',
        redirect_uri: `${frontend}/api/auth/oauth/linkedin/callback`,
        response_type: 'code',
        scope: 'openid profile email',
      });
      res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
    } else {
      res.redirect(frontend + '/login');
    }
  }

  @Get('auth/oauth/google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    const frontend = this.config.get('FRONTEND_URL') ?? 'http://localhost:3000';
    if (!code) return res.redirect(frontend + '/login?error=OAuthCallback');
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: this.config.get('GOOGLE_CLIENT_ID') ?? '',
          client_secret: this.config.get('GOOGLE_CLIENT_SECRET') ?? '',
          redirect_uri: `${frontend}/api/auth/oauth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (!tokens.access_token) throw new Error('no token');
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await profileRes.json();
      const result = await this.auth.findOrCreateOAuthUser('google', {
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      });
      res.cookie('token', result.token, COOKIE_OPTIONS);
      res.redirect(frontend + this.roleHome(result.role));
    } catch (e) {
      console.error('Google OAuth error', e);
      res.redirect(frontend + '/login?error=OAuthCallback');
    }
  }

  @Get('auth/oauth/linkedin/callback')
  async linkedinCallback(@Query('code') code: string, @Res() res: any) {
    const frontend = this.config.get('FRONTEND_URL') ?? 'http://localhost:3000';
    if (!code) return res.redirect(frontend + '/login?error=OAuthCallback');
    try {
      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: this.config.get('LINKEDIN_CLIENT_ID') ?? '',
          client_secret: this.config.get('LINKEDIN_CLIENT_SECRET') ?? '',
          redirect_uri: `${frontend}/api/auth/oauth/linkedin/callback`,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (!tokens.access_token) throw new Error('no token');
      const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await profileRes.json();
      const result = await this.auth.findOrCreateOAuthUser('linkedin', {
        email: profile.email,
        name: profile.name ?? profile.localizedFirstName,
        picture: profile.picture,
      });
      res.cookie('token', result.token, COOKIE_OPTIONS);
      res.redirect(frontend + this.roleHome(result.role));
    } catch (e) {
      console.error('LinkedIn OAuth error', e);
      res.redirect(frontend + '/login?error=OAuthCallback');
    }
  }

  private roleHome(role: string) {
    switch (role) {
      case 'COMPANY':
        return '/employer';
      case 'INSTITUTION':
        return '/institution';
      case 'ADMIN':
        return '/admin';
      default:
        return '/dashboard';
    }
  }
}
