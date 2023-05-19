import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { FileRepository } from './file.repository';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [FileService, FileRepository],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
