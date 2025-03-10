import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>{
    console.log("LocalAuthGuard -> canActivate() called" , context);

    const result = super.canActivate(context); 
    console.log("LocalAuthGuard -> super.canActivate(context) returned:", result);

    return result; 
}

handleRequest(err, user, info) {
    console.log("LocalAuthGuard -> handleRequest() called, user:", user);
    if (err || !user) {
        console.log("3");
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
