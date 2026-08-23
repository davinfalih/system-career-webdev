import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { JobsModule } from './jobs/jobs.module';
import { AiModule } from './ai/ai.module';
import { CompanyModule } from './company/company.module';
import { InstitutionModule } from './institution/institution.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { ApplicationsModule } from './applications/applications.module';
import { EmployerModule } from './employer/employer.module';
import { MetaModule } from './meta/meta.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    JobsModule,
    AiModule,
    CompanyModule,
    InstitutionModule,
    AdminModule,
    NotificationsModule,
    ReportsModule,
    ApplicationsModule,
    EmployerModule,
    MetaModule,
  ],
})
export class AppModule {}
