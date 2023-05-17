import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/enum/user-roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user.role;
    const requiredRole = this.reflector.get<string>(
      'role',
      context.getHandler(),
    );

    if (
      !requiredRole ||
      userRole == UserRole.SUPER_USER ||
      (requiredRole == UserRole.NORMAL_USER && userRole == UserRole.ADMIN_USER)
    )
      return true;

    return userRole === requiredRole;
  }
}
