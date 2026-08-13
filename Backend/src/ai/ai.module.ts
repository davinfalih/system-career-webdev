import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AiController } from './ai.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [AiController],
})
export class AiModule {}
