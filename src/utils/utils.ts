import { Campaign, User, UsersOnCampaigns } from '@prisma/client';
import * as dayjs from 'dayjs';
import { resolve } from 'path';

export const formatDate = (date: Date) => {
  return dayjs(date).subtract(3, 'hours').format('DD/MM/YYYY');
};

export const formatHours = (date: Date) => {
  return dayjs(date).subtract(3, 'hours').format('HH:mm');
};

export const formatCpf = (cpf: string): string => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const formattedUsers = (users): User[] => {
  return users.map((user) => ({
    id: user?.id,
    name: user?.name,
    cpf: user?.cpf,
    phone: user?.phone,
    email: user?.email,
    role: user?.role,
    createdAt: formatDate(user?.createdAt),
  }));
};

export const formattedCampaigns = (campaigns): Campaign[] => {
  return campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    createdAt: formatDate(campaign.createdAt),
    admin: {
      ...campaign?.admin,
    },
    files: campaign.files.map((file) => ({
      id: file.file?.id,
      url: resolve(__dirname, '..', '..', '..', 'uploads', file.file?.url),
      fileName: file.file?.url,
    })),
  }));
};

export const formattedCampaign = (campaign) => {
  return {
    id: campaign.id,
    title: campaign.title,
    createdAt: formatDate(campaign.createdAt),
    admin: {
      ...campaign?.admin,
    },
    files: campaign.files.map((file) => ({
      id: file.file?.id,
      url: resolve(__dirname, '..', '..', '..', 'uploads', file.file?.url),
      fileName: file.file?.url,
    })),
    users: campaign.users.map((user) => ({
      ...user?.user,
      status: user?.status,
    })),
  };
};

export const formattedAdminCampaigns = (campaigns): Campaign[] => {
  return campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    createdAt: formatDate(campaign.createdAt),
    users: campaign.users.map((user) => ({
      ...user?.user,
    })),
    files: campaign.files.map((file) => ({
      id: file.file?.id,
      url: resolve(__dirname, '..', '..', '..', 'uploads', file.file?.url),
      fileName: file.file?.url,
    })),
  }));
};

export const formattedCampaignRequests = (requests): UsersOnCampaigns[] => {
  return requests.map((request) => ({
    id: request.id,
    campaign: {
      id: request.campaign?.id,
      title: request.campaign?.title,
      createdAt: formatDate(request.campaign?.createdAt),
      admin: {
        ...request?.campaign?.admin,
      },
    },
    user: {
      ...request?.user,
    },
  }));
};

export const formattedUserRequests = (requests) => {
  return requests.map((request) => ({
    id: request.id,
    status: request.status,
    campaign: {
      id: request.campaign?.id,
      title: request.campaign?.title,
      createdAt: formatDate(request.campaign?.createdAt),
      admin: {
        ...request?.campaign?.admin,
      },
    },
    files: request.campaign.files.map((file) => ({
      id: file.file?.id,
      url: resolve(__dirname, '..', '..', '..', 'uploads', file.file?.url),
      fileName: file.file?.url,
    })),
  }));
};

export const generateRandomCode = (length: number): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
