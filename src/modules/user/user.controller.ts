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
import { ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserRole } from './enum/user-roles.enum';
import { Role } from '../auth/decorator/role.decorator';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/admin')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  @ApiBearerAuth()
  @ApiBody({ type: FindUsersQueryDto })
  async getUsers(@Query() query: FindUsersQueryDto) {
    return await this.userService.getUsers(query);
  }

  @Put('/admin/approve/:userId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.ADMIN_USER)
  @ApiBearerAuth()
  async approveUser(@Param('userId') id: string) {
    return await this.userService.approveUser(id);
  }

  @Put('/update')
  @UseGuards(AuthGuard())
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  async updateUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(user, updateUserDto);
  }

  @Delete('/')
  @UseGuards(AuthGuard(), RolesGuard)
  @Role(UserRole.NORMAL_USER)
  @ApiBody({ type: DeleteUserDto })
  @ApiBearerAuth()
  async deleteUser(
    @GetUser() user: User,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return await this.userService.deleteUser(user, deleteUserDto);
  }
}
