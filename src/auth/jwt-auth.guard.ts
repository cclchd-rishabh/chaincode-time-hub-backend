import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log("Headers ->", request.headers);

    const authHeader = request.headers['authorization'];  
    console.log("Auth Header ->", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);
      console.log("Decoded User:", decoded);
      request.user = decoded;
      return true;
    } catch (error) {
      console.error("JWT Verification Error:", error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
