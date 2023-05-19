import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';

const user: User = {
  id: 'string',
  email: 'string',
  name: 'string',
  password: 'string',
  phone: 'string',
  cpf: 'string',
  role: 'string',
  code: 'l1tzYd',
  resetPasswordExpires: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  refreshToken:
    'BPoc7uUB4BfJ6d39Xa3YbfgggApjoYmhQB9rsUxakE4GpKm2x8.DL6kMK57H0c5yn1B7zMTyy0Jbdm7qiE4It7O9pkFqA88HXWnRu.RQkIVLYcIYPw6EtbqFQD4DAtCErxqo2iTRNEfmlJFqhrYvTjeD',
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [UserController],
      providers: [UserService, UserRepository],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user', async () => {
    const user = jest
      .spyOn(service, 'getUsers')
      .mockImplementation(async () => user);
    expect(user).toBeDefined();
  });

  it('should update user', async () => {
    const response = jest
      .spyOn(service, 'updateUser')
      .mockImplementation(async () => user);
    expect(response).toBeDefined();
  });
});
