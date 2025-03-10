import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
// import { LocalStrategy } from './local-strategy';



@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    console.log("Login request received with user:", req.user);
    return this.authService.login(req.user);
  }
}
