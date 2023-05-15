import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { validateCreateUser } from './validators/validate-create-user';
import { validateCPF } from 'src/utils/validate-cpf';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserRepository } from '../user/user.repository';
import { CredentialsDto } from './dto/credentials.dto';
import { validateCredentials } from './validators/validate-credentials';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { validateRefreshToken } from './validators/validate-refresh-token';
import { UserRole } from '../user/enum/user-roles.enum';

@Injectable()
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto, role: UserRole) {
    try {
      validateCreateUser(createUserDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    const { password, confirmPassword } = createUserDto;
    validateCPF(createUserDto.cpf);
    if (password !== confirmPassword)
      throw new BadRequestException('Passwords do not match');
    return await this.userRepository.createUser(createUserDto, role);
  }

  async signIn(credentialsDto: CredentialsDto) {
    try {
      validateCredentials(credentialsDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }

    return await this.userRepository.checkCredentials(credentialsDto);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      validateRefreshToken(refreshTokenDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    return await this.userRepository.refreshToken(refreshTokenDto);
  }
}
