import { Injectable } from '@nestjs/common';
import { FileRepository } from './file.repository';

@Injectable()
export class FileService {
  constructor(private fileRepository: FileRepository) {}

  async uploadFile(files, campaignId: string) {
    return await this.fileRepository.uploadFile(files, campaignId);
  }

  async deleteFile(fileId: string) {
    return await this.fileRepository.deleteFile(fileId);
  }
}
