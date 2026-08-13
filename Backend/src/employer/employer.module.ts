import { Module } from '@nestjs/common';
import { EmployerController } from './employer.controller';

@Module({
  controllers: [EmployerController],
})
export class EmployerModule {}
