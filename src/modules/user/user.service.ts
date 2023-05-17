import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUsers(query: FindUsersQueryDto) {
    return await this.userRepository.getUsers(query);
  }

  async approveUser(userId: string) {
    return await this.userRepository.approveUser(userId);
  }
}
