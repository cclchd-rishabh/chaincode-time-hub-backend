import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class AuthService {
  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService
  ) {}
  async validateUser(username: string, password: string): Promise<any> {
    const result = await this.dbService.query('SELECT * FROM users WHERE username = ?', [username]);
    console.log('Query Result:', result);
    
    const user = Array.isArray(result) ? result[0] as RowDataPacket : result as unknown as RowDataPacket; // ✅ Extract object directly
    
    console.log("Extracted User Object:", user);
    
    if (!user || !user.password) {
        console.log("User object structure is incorrect!", user);
        throw new UnauthorizedException('Invalid credentials');
    }
    
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    let isPasswordValid ;
    console.log(isPasswordValid);
    console.log(password);
    console.log(user.password);
    if(password==user.password){
        isPasswordValid=true;
    }else{
        isPasswordValid=false;
    }
    console.log(isPasswordValid);
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
      role : user.role
    };
  }

}
