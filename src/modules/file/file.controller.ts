import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Controller('file')
@ApiTags('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('/campaign/:campaignId')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFiles() files,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.fileService.uploadFile(files, campaignId);
  }

  @Delete('/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.fileService.deleteFile(fileId);
  }
}
