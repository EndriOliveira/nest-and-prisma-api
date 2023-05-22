export interface IFileRepository {
  uploadFile(files: any, campaignId: string): Promise<any>;
  deleteFile(fileId: string): Promise<any>;
}
