import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, Res, StreamableFile, Body, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import 'multer';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':id/track')
  @HttpCode(200)
  async track(@Param('id') id: string, @Body() body: any) {
    console.log('OnlyOffice callback for document', id, 'Status:', body.status);
    
    if (body.status === 2) { // Ready for saving
      console.log('Saving document version from:', body.url);
      try {
        await this.documentsService.updateFile(id, body.url);
        console.log('Document', id, 'saved successfully');
      } catch (error) {
        console.error('Error saving document', id, error.message);
        return { error: 1 };
      }
    }
    
    return { error: 0 };
  }


  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads';
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async uploadFile(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
      ],
    }),
  ) file: Express.Multer.File) {
    return this.documentsService.create(file);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const doc = await this.documentsService.findOne(id);
    if (!doc) {
      throw new Error('Document not found');
    }

    const file = createReadStream(join(process.cwd(), doc.path));
    res.set({
      'Content-Type': doc.mimeType,
      'Content-Disposition': `attachment; filename="${doc.filename}"`,
    });
    return new StreamableFile(file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
