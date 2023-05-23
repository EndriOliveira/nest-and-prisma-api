import { File } from '@prisma/client';
import { IFileRepository } from '../../src/modules/file/Ifile.repository';

export class InMemoryFileRepository implements IFileRepository {
  private files: File[] = [];

  async uploadFile(files, campaignId: string) {
    this.files.push(files);
    return {
      message: 'Files uploaded successfully',
    };
  }

  async deleteFile(fileId: string) {
    this.files = this.files.filter((file) => file.id !== fileId);
    return {
      message: 'File deleted successfully',
    };
  }
}
