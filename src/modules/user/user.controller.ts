import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from './enum/user-roles.enum';
import { Role } from '../auth/decorator/role.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers(@Query() query: FindUsersQueryDto) {
    return await this.userService.getUsers(query);
  }

  @Put('/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  async approveUser(@Param('id') id: string) {
    return await this.userService.approveUser(id);
  }
}
