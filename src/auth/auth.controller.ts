import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
// import { LocalStrategy } from './local-strategy';
import { Options, Req, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Options('*')
  handlePreflight(@Req() req: Request, @Res() res: Response) {
    const origin = req.headers['origin'] || '*';
    
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    
    res.status(204).send();
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req, @Res() res) {
    const origin = req.headers['origin'] || '*';
    
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    const loginResponse = await this.authService.login(req.user);
    return res.json(loginResponse);
  }
}