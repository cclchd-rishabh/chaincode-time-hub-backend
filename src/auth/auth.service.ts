import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private jwtService: JwtService
  ) {}

 
  async validateUser(username: string, password: string): Promise<any> {
    // Find user by username
    const user = await this.userModel.findOne({ where: { username } });
  
    console.log('Extracted User Object:', user);
  
    if (!user || !user.password) {
      console.log("User not found or password field missing");
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password");
      throw new UnauthorizedException('Invalid credentials');
    }
  
    return { id: user.id, username: user.username, role: user.role };
  }
  
  
    async login(user: any) {
      const payload = { username: user.username, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        role:user.role
      };
    }
}
