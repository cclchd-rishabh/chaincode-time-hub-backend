import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
// import { LocalStrategy } from './local-strategy';
import { Options, Req, Res } from '@nestjs/common';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // @Options('login')
  // handlePreflight(@Req() req, @Res() res) {
  //   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000','https://timehub.chaincodeconsulting.com/');
  //   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  //   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  //   res.setHeader('Access-Control-Allow-Credentials', 'true');
  //   res.status(204).send(); // Use 204 No Content for preflight requests
  // }

 @Post('login')
@UseGuards(AuthGuard('local'))
async login(@Request() req) {
  console.log("Login request received with user:", req.user);
  return this.authService.login(req.user);
}

}
