import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule
 * Global module providing PrismaService across the entire NestJS application.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
