/*
  Warnings:

  - The primary key for the `Campaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `title` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `adminId` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `File` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `url` on the `File` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `FilesOnCampaigns` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `FilesOnCampaigns` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `campaignId` on the `FilesOnCampaigns` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `fileId` on the `FilesOnCampaigns` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `cpf` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `phone` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `refreshToken` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `code` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `resetPasswordExpires` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_adminId_fkey";

-- DropForeignKey
ALTER TABLE "FilesOnCampaigns" DROP CONSTRAINT "FilesOnCampaigns_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "FilesOnCampaigns" DROP CONSTRAINT "FilesOnCampaigns_fileId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "adminId" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "File" DROP CONSTRAINT "File_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "url" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FilesOnCampaigns" DROP CONSTRAINT "FilesOnCampaigns_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "campaignId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "fileId" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "FilesOnCampaigns_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "refreshToken" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "resetPasswordExpires" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilesOnCampaigns" ADD CONSTRAINT "FilesOnCampaigns_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilesOnCampaigns" ADD CONSTRAINT "FilesOnCampaigns_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
