import { BadRequestException, Injectable } from '@nestjs/common';
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
    const validate = validateUpdateUser(updateUserDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    if (updateUserDto.cpf) validateCPF(updateUserDto.cpf);
    return await this.userRepository.updateUser(user, updateUserDto);
  }

  async deleteUser(user: User, deleteUserDto: DeleteUserDto) {
    const validate = validateDeleteUser(deleteUserDto);
    if (!validate['success'])
      throw new BadRequestException(validate['error'].issues);
    return await this.userRepository.deleteUser(user, deleteUserDto);
  }
}
