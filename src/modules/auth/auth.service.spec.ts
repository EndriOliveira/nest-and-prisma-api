import { AuthService } from './auth.service';
import { UserRepository } from '../user/user.repository';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { InMemoryUserRepository } from '../../../test/repositories/inMemoryUser.repository';
import { InMemorySendgridService } from '../../../test/services/inMemorySendGrid.service';
import { UserRole } from '../user/enum/user-roles.enum';
import { UserService } from '../user/user.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    authService = new AuthService(
      new InMemoryUserRepository() as unknown as UserRepository,
      new InMemorySendgridService() as unknown as SendgridService,
    );
    userService = new UserService(
      new InMemoryUserRepository() as unknown as UserRepository,
    );
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should create user', async () => {
    const response = await authService.createUser(
      {
        name: 'Test User Third',
        email: 'user.test03@example.com',
        cpf: '757.488.400-57',
        password: 'password!Teste15',
        confirmPassword: 'password!Teste15',
        phone: '(11) 95622-1234',
      },
      UserRole.UNREGISTERED,
    );

    expect(response).toHaveProperty('id');
  });

  it('should log in', async () => {
    const response = await authService.signIn({
      email: 'user.test02@example.com',
      password: 'password!Teste15',
    });
    expect(response).toHaveProperty('token');
  });

  it('should change password', async () => {
    const users = await userService.getUsers({ sort: '', page: 1, limit: 10 });

    const response = await authService.changePassword(users[1], {
      password: 'password!Teste15',
      newPassword: 'newPassword!Teste15',
      confirmNewPassword: 'newPassword!Teste15',
    });
    expect(response).toHaveProperty('id');
  });

  it('should create user', async () => {
    const response = await authService.createUser(
      {
        name: 'Test User Secondary',
        email: 'user.test03@example.com',
        cpf: '287.487.030-79',
        password: 'password!Teste15',
        confirmPassword: 'password!Teste15',
        phone: '(11) 95221-9163',
      },
      UserRole.UNREGISTERED,
    );
    expect(response).toHaveProperty('id');
  });
});
