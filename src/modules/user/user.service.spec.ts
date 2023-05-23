import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { InMemoryUserRepository } from '../../../test/repositories/inMemoryUser.repository';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    userService = new UserService(
      new InMemoryUserRepository() as unknown as UserRepository,
    );
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should approve user', async () => {
    const response = await userService.approveUser(
      '5484206c-cd06-4e24-a2ba-8561b1b1e1c3',
    );
    expect(response).toStrictEqual({ message: 'User approved' });
  });

  it('already approved user error', async () => {
    await userService.approveUser('5484206c-cd06-4e24-a2ba-8561b1b1e1c3');
    const response = await userService.approveUser(
      '5484206c-cd06-4e24-a2ba-8561b1b1e1c3',
    );
    expect(response).toStrictEqual({ message: 'User already approved' });
  });

  it('should return user', async () => {
    const user = await userService.getUsers({ sort: '', page: 1, limit: 10 });
    expect(user).toBeDefined();
  });

  it('should update user', async () => {
    const user = await userService.getUsers({ sort: '', page: 1, limit: 10 });
    const response = await userService.updateUser(user[0], {
      name: 'New Test User',
      password: 'password!Teste15',
    });
    expect(response).toHaveProperty('name');
  });

  it('should delete user', async () => {
    const user = await userService.getUsers({ sort: '', page: 1, limit: 10 });
    const response = await userService.deleteUser(user[0], {
      password: 'password!Teste15',
    });
    expect(response).toStrictEqual({ message: 'User deleted' });
  });
});
