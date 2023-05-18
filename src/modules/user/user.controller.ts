import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from './enum/user-roles.enum';
import { Role } from '../auth/decorator/role.decorator';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers(@Query() query: FindUsersQueryDto) {
    return await this.userService.getUsers(query);
  }

  @Put('/approve/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  async approveUser(@Param('id') id: string) {
    return await this.userService.approveUser(id);
  }

  @Put('/update')
  @UseGuards(AuthGuard())
  async updateUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(user, updateUserDto);
  }

  @Delete('/')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.NORMAL_USER)
  async deleteUser(
    @GetUser() user: User,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return await this.userService.deleteUser(user, deleteUserDto);
  }
}
