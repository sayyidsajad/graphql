import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const ctx = GqlExecutionContext.create(context);
    const authHeader = ctx.getContext().req.headers.authorization;
    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];
    try {
        const decoded = this.jwtService.verify(token, {
            secret: process.env.JWT_SECRET,
          });
      ctx.getContext().user = decoded;

      return requiredRoles.includes(decoded.role);
    } catch (e) {      
      return false;
    }
  }
}
