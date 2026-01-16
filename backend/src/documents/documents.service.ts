import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import 'multer';
import { CreateDocumentDto } from './dto/create-document.dto';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async updateFile(id: string, downloadUrl: string) {
    const doc = await this.findOne(id);
    if (!doc) throw new Error('Document not found');

    // OnlyOffice might return a URL with 'localhost:8080' if that's how the user accesses it.
    // The backend container needs to use the internal Docker hostname 'onlyoffice:80'.
    const internalUrl = downloadUrl.replace('localhost:8080', 'onlyoffice:80');
    console.log('Downloading updated file from internal URL:', internalUrl);

    const response = await axios.get(internalUrl, { responseType: 'stream' });
    const writer = createWriteStream(join(process.cwd(), doc.path));
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });

    // Touch the database record to update updatedAt
    await this.prisma.document.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }


  async create(file: Express.Multer.File) {
    // In a real app, you would save the file to a specific path
    // For now, we assume Multer saved it to the 'uploads' folder mapping
    
    return this.prisma.document.create({
      data: {
        filename: file.originalname,
        path: file.path,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
  }

  async findAll() {
    return this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }
}
