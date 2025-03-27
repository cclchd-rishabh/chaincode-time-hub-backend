import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
// import { LocalStrategy } from './local-strategy';
import { Options, Req, Res } from '@nestjs/common';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Options('login')
  handlePreflight(@Req() req, @Res() res) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    console.log("Login request received with user:", req.user);
    return this.authService.login(req.user);
  }
}
