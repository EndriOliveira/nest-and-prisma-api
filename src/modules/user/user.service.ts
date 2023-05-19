import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { validateUpdateUser } from './validators/validate-update-user';
import { validateCPF } from '../../utils/validate-cpf';
import { DeleteUserDto } from './dto/delete-user.dto';
import { validateDeleteUser } from './validators/validate-delete-user';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUsers(query: FindUsersQueryDto) {
    return await this.userRepository.getUsers(query);
  }

  async approveUser(userId: string) {
    return await this.userRepository.approveUser(userId);
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto) {
    try {
      validateUpdateUser(updateUserDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    if (updateUserDto.cpf) validateCPF(updateUserDto.cpf);
    return await this.userRepository.updateUser(user, updateUserDto);
  }

  async deleteUser(user: User, deleteUserDto: DeleteUserDto) {
    try {
      validateDeleteUser(deleteUserDto);
    } catch (error) {
      if (error['name'] === 'ZodError') {
        throw new BadRequestException(error['issues']);
      } else {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }
    return await this.userRepository.deleteUser(user, deleteUserDto);
  }
}
