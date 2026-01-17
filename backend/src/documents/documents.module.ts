import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController, AiController],
  providers: [DocumentsService, AiService, PrismaService],
})
export class DocumentsModule {}
