import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {

    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log(" Validating User: ", username, "Password:", password);
    
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      console.log(" No user found");
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log(" User validated successfully:", user);
    return user;
  }
  
}
