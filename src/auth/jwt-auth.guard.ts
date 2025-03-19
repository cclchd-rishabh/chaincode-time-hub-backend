import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log("Headers ->", request.headers);
    try{
    const authHeader = request.headers['authorization'];  
    console.log("Auth Header ->", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("NO Header");
      throw new UnauthorizedException('Not Authorized');
    }

    const token = authHeader.split(' ')[1];

    
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