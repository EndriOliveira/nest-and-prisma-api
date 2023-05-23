import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';
import { unlink } from 'fs';
import { resolve } from 'path';
import { IFileRepository } from './Ifile.repository';

export class FileRepository implements IFileRepository {
  constructor(private prismaClient: PrismaClient = new PrismaClient()) {}

  async uploadFile(files, campaignId: string): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const campaign = await this.prismaClient.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('Campaign not found');
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = await this.prismaClient.file.create({
          data: {
            id: uuidV4(),
            url: files[i].filename,
          },
        });
        await this.prismaClient.filesOnCampaigns.create({
          data: {
            id: uuidV4(),
            campaignId,
            fileId: file.id,
          },
        });
      }
      await this.prismaClient.$disconnect();
      return {
        message: 'Files uploaded successfully',
      };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    await this.prismaClient.$connect();
    const query = await this.prismaClient.file.findFirst({
      where: { id: fileId },
    });

    if (!query) {
      await this.prismaClient.$disconnect();
      throw new NotFoundException('File not found');
    }

    const filePath = resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads',
      query?.url,
    );

    unlink(filePath, async (err) => {
      if (err) {
        await this.prismaClient.$disconnect();
        throw new InternalServerErrorException('Internal Server Error');
      }
    });

    try {
      await this.prismaClient.file.delete({
        where: { id: fileId },
      });
      await this.prismaClient.$disconnect();
      return {
        message: 'File deleted successfully',
      };
    } catch (error) {
      await this.prismaClient.$disconnect();
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
